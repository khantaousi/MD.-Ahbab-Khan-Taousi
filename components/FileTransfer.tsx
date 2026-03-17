import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Download, File as FileIcon, CheckCircle, AlertCircle, Loader2, Copy, Play, Square, Info } from 'lucide-react';
import { doc, setDoc, onSnapshot, updateDoc, deleteDoc, collection, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';

interface FileTransferProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
  isLightMode: boolean;
}

type ConnectionState = 'idle' | 'waiting' | 'connecting' | 'connected' | 'failed' | 'disconnected';
type TransferState = 'idle' | 'transferring' | 'completed' | 'failed' | 'cancelled';

const CHUNK_SIZE = 16384; // 16KB chunks for WebRTC

const FileTransfer: React.FC<FileTransferProps> = ({ isOpen, onClose, accentColor, isLightMode }) => {
  const [file, setFile] = useState<File | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [isSender, setIsSender] = useState<boolean>(true);
  const [connState, setConnState] = useState<ConnectionState>('idle');
  const [transferState, setTransferState] = useState<TransferState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0); // bytes per second
  const [error, setError] = useState<string>('');
  const [attempt, setAttempt] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const fileReader = useRef<FileReader | null>(null);
  const receiveBuffer = useRef<ArrayBuffer[]>([]);
  const receivedSize = useRef<number>(0);
  const fileMeta = useRef<{ name: string; size: number; type: string } | null>(null);
  
  const startTime = useRef<number>(0);
  const lastBytes = useRef<number>(0);
  const lastTime = useRef<number>(0);
  const speedInterval = useRef<NodeJS.Timeout | null>(null);

  // Check URL for room ID on mount or open
  useEffect(() => {
    if (isOpen) {
      const params = new URLSearchParams(window.location.search);
      const room = params.get('transfer');
      if (room) {
        setRoomId(room);
        setIsSender(false);
      }
    }
  }, [isOpen]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      cleanup();
      setFile(null);
      setRoomId('');
    }
    return () => { cleanup(); };
  }, [isOpen]);

  const cleanup = async (resetState = true) => {
    if (speedInterval.current) clearInterval(speedInterval.current);
    if (dataChannel.current) dataChannel.current.close();
    if (peerConnection.current) peerConnection.current.close();
    if (fileReader.current && fileReader.current.readyState === 1) fileReader.current.abort();
    
    if (roomId && isSender && resetState) {
      try {
        await deleteDoc(doc(db, 'transfers', roomId));
      } catch (e) {
        console.error('Error deleting room:', e);
      }
    }
    
    peerConnection.current = null;
    dataChannel.current = null;
    receiveBuffer.current = [];
    receivedSize.current = 0;
    fileMeta.current = null;
    
    if (resetState) {
      setConnState('idle');
      setTransferState('idle');
      setProgress(0);
      setSpeed(0);
      setError('');
      setFile(null);
      setRoomId('');
    }
  };

  const setupPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    pc.oniceconnectionstatechange = () => {
      console.log('ICE State:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setConnState('disconnected');
        if (transferState === 'transferring') {
          setTransferState('failed');
          setError('Connection lost during transfer.');
        }
      } else if (pc.iceConnectionState === 'connected') {
        setConnState('connected');
      }
    };

    peerConnection.current = pc;
    return pc;
  };

  const startSender = async (currentAttempt = 1) => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    try {
      setConnState('waiting');
      setError('');
      
      let currentRoomId = roomId;
      let roomRef;
      
      if (!currentRoomId) {
        roomRef = doc(collection(db, 'transfers'));
        currentRoomId = roomRef.id;
        setRoomId(currentRoomId);
      } else {
        roomRef = doc(db, 'transfers', currentRoomId);
      }
      
      const pc = setupPeerConnection();
      
      // Create Data Channel
      const dc = pc.createDataChannel('fileTransfer', { ordered: true });
      setupDataChannel(dc);
      dataChannel.current = dc;

      // Handle ICE candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          const callerCandidatesCollection = collection(roomRef, `callerCandidates_${currentAttempt}`);
          await addDoc(callerCandidatesCollection, event.candidate.toJSON());
        }
      };

      // Create Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const roomWithOffer = {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
        attempt: currentAttempt,
        createdAt: new Date().toISOString()
      };
      await setDoc(roomRef, roomWithOffer);

      // Listen for Answer
      onSnapshot(roomRef, async (snapshot) => {
        const data = snapshot.data();
        if (!pc.currentRemoteDescription && data && data.answer && data.attempt === currentAttempt) {
          const rtcSessionDescription = new RTCSessionDescription(data.answer);
          await pc.setRemoteDescription(rtcSessionDescription);
        }
      });

      // Listen for remote ICE candidates
      onSnapshot(collection(roomRef, `calleeCandidates_${currentAttempt}`), (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            let data = change.doc.data();
            await pc.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });

    } catch (err: any) {
      console.error('Error starting sender:', err);
      setError('Failed to create transfer room: ' + err.message);
      setConnState('failed');
    }
  };

  const joinReceiver = async () => {
    if (!roomId) {
      setError('Invalid transfer link.');
      return;
    }

    try {
      setConnState('connecting');
      setError('');
      
      const roomRef = doc(db, 'transfers', roomId);
      const roomSnapshot = await getDoc(roomRef);
      
      if (!roomSnapshot.exists()) {
        setError('Transfer room not found or expired.');
        setConnState('failed');
        return;
      }

      const roomData = roomSnapshot.data();
      const currentAttempt = roomData.attempt || 1;

      const pc = setupPeerConnection();

      // Handle incoming Data Channel
      pc.ondatachannel = (event) => {
        setupDataChannel(event.channel);
        dataChannel.current = event.channel;
      };

      // Handle ICE candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          const calleeCandidatesCollection = collection(roomRef, `calleeCandidates_${currentAttempt}`);
          await addDoc(calleeCandidatesCollection, event.candidate.toJSON());
        }
      };

      // Set Remote Description (Offer)
      const offer = roomData.offer;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Create Answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const roomWithAnswer = {
        answer: {
          type: answer.type,
          sdp: answer.sdp,
        },
        attempt: currentAttempt
      };
      await updateDoc(roomRef, roomWithAnswer);

      // Listen for remote ICE candidates
      onSnapshot(collection(roomRef, `callerCandidates_${currentAttempt}`), (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            let data = change.doc.data();
            await pc.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });

    } catch (err: any) {
      console.error('Error joining receiver:', err);
      setError('Failed to join transfer: ' + err.message);
      setConnState('failed');
    }
  };

  const setupDataChannel = (dc: RTCDataChannel) => {
    dc.binaryType = 'arraybuffer';

    dc.onopen = () => {
      setConnState('connected');
      if (isSender && file) {
        // Send metadata first
        const metadata = {
          type: 'metadata',
          name: file.name,
          size: file.size,
          fileType: file.type
        };
        dc.send(JSON.stringify(metadata));
      }
    };

    dc.onclose = () => {
      if (transferState === 'transferring') {
        setTransferState('failed');
        setError('Connection closed unexpectedly.');
      }
    };

    dc.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'metadata') {
            fileMeta.current = { name: msg.name, size: msg.size, type: msg.fileType };
            // Acknowledge metadata
            dc.send(JSON.stringify({ type: 'ready' }));
          } else if (msg.type === 'ready') {
            // Receiver is ready, start sending file
            sendFile();
          } else if (msg.type === 'cancel') {
            setTransferState('cancelled');
            setError('Transfer cancelled by peer.');
            if (fileReader.current) fileReader.current.abort();
          }
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      } else {
        // Receiving file chunk
        receiveBuffer.current.push(event.data);
        receivedSize.current += event.data.byteLength;
        
        if (fileMeta.current) {
          const currentProgress = Math.round((receivedSize.current / fileMeta.current.size) * 100);
          setProgress(currentProgress);
          setTransferState('transferring');
          
          // Calculate speed
          if (startTime.current === 0) {
            startTime.current = Date.now();
            lastTime.current = Date.now();
            
            speedInterval.current = setInterval(() => {
              const now = Date.now();
              const timeDiff = (now - lastTime.current) / 1000;
              if (timeDiff > 0) {
                const bytesDiff = receivedSize.current - lastBytes.current;
                setSpeed(bytesDiff / timeDiff);
                lastBytes.current = receivedSize.current;
                lastTime.current = now;
              }
            }, 1000);
          }

          if (receivedSize.current === fileMeta.current.size) {
            finishReceive();
          }
        }
      }
    };
  };

  const sendFile = () => {
    if (!file || !dataChannel.current) return;
    
    setTransferState('transferring');
    startTime.current = Date.now();
    lastTime.current = Date.now();
    lastBytes.current = 0;
    
    speedInterval.current = setInterval(() => {
      const now = Date.now();
      const timeDiff = (now - lastTime.current) / 1000;
      if (timeDiff > 0) {
        // We calculate speed based on progress state which is updated in read slice
        // but for sender, it's better to calculate based on offset
      }
    }, 1000);

    let offset = 0;
    fileReader.current = new FileReader();
    
    fileReader.current.onerror = (error) => {
      console.error('Error reading file:', error);
      setTransferState('failed');
      setError('Error reading file.');
    };

    fileReader.current.onabort = () => {
      console.log('File reading aborted');
    };

    fileReader.current.onload = (e) => {
      if (!dataChannel.current || dataChannel.current.readyState !== 'open') {
        return;
      }
      
      if (e.target && e.target.result) {
        const sendNext = () => {
          if (!dataChannel.current || dataChannel.current.readyState !== 'open') return;
          
          // Wait if buffer is getting full (e.g., > 1MB)
          if (dataChannel.current.bufferedAmount > 1024 * 1024) {
            dataChannel.current.onbufferedamountlow = () => {
              dataChannel.current!.onbufferedamountlow = null;
              sendNext();
            };
            return;
          }
          
          try {
            dataChannel.current.send(e.target.result as ArrayBuffer);
            offset += (e.target.result as ArrayBuffer).byteLength;
            
            const currentProgress = Math.round((offset / file.size) * 100);
            setProgress(currentProgress);
            
            const now = Date.now();
            const timeDiff = (now - lastTime.current) / 1000;
            if (timeDiff >= 1) {
              const bytesDiff = offset - lastBytes.current;
              setSpeed(bytesDiff / timeDiff);
              lastBytes.current = offset;
              lastTime.current = now;
            }

            if (offset < file.size) {
              readSlice(offset);
            } else {
              setTransferState('completed');
              if (speedInterval.current) clearInterval(speedInterval.current);
            }
          } catch (err) {
            console.error('Error sending chunk:', err);
            setTransferState('failed');
            setError('Failed to send data.');
          }
        };
        
        sendNext();
      }
    };

    const readSlice = (o: number) => {
      if (!file || !fileReader.current) return;
      const slice = file.slice(o, o + CHUNK_SIZE);
      fileReader.current.readAsArrayBuffer(slice);
    };

    readSlice(0);
  };

  const finishReceive = () => {
    if (!fileMeta.current) return;
    
    setTransferState('completed');
    if (speedInterval.current) clearInterval(speedInterval.current);
    
    const blob = new Blob(receiveBuffer.current, { type: fileMeta.current.type });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileMeta.current.name;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const cancelTransfer = () => {
    if (dataChannel.current && dataChannel.current.readyState === 'open') {
      dataChannel.current.send(JSON.stringify({ type: 'cancel' }));
    }
    if (fileReader.current) fileReader.current.abort();
    
    if (connState === 'waiting') {
      cleanup(true);
    } else {
      setTransferState('cancelled');
      cleanup(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bps: number) => {
    return formatSize(bps) + '/s';
  };

  const getShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('transfer', roomId);
    return url.toString();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getShareLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const bgClass = isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10';
  const textClass = isLightMode ? 'text-slate-900' : 'text-white';
  const textMutedClass = isLightMode ? 'text-slate-500' : 'text-slate-400';
  const inputBgClass = isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-white/10';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl flex flex-col gap-6 ${bgClass}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-black flex items-center gap-2 ${textClass}`}>
            <Upload size={24} style={{ color: accentColor }} />
            P2P File Transfer
          </h2>
          <button onClick={onClose} className={`${textMutedClass} hover:${textClass} transition-colors p-1`}>
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Main Content */}
        {!roomId && isSender ? (
          // Sender: Select File
          <div className="space-y-4">
            <div 
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer
                ${file ? (isLightMode ? 'border-slate-300 bg-slate-50' : 'border-white/20 bg-white/5') : (isLightMode ? 'border-slate-200 hover:border-slate-400' : 'border-white/10 hover:border-white/30')}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input type="file" id="file-upload" className="hidden" onChange={handleFileSelect} />
              
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileIcon size={40} style={{ color: accentColor }} />
                  <p className={`font-bold truncate max-w-full px-4 ${textClass}`}>{file.name}</p>
                  <p className={`text-xs ${textMutedClass}`}>{formatSize(file.size)}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload size={32} className={textMutedClass} />
                  <p className={`text-sm font-medium ${textClass}`}>Click or drag file to upload</p>
                  <p className={`text-xs ${textMutedClass}`}>Direct P2P transfer, no size limit</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => startSender(1)}
              disabled={!file || connState !== 'idle'}
              className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: accentColor, color: '#000' }}
            >
              {connState === 'idle' ? 'Generate Link' : <><Loader2 size={16} className="animate-spin" /> Creating Room...</>}
            </button>
          </div>
        ) : (
          // Transfer UI (Sender waiting, Receiver joining, or Transferring)
          <div className="space-y-6">
            
            {/* Status Indicator */}
            <div className={`p-4 rounded-xl border flex flex-col gap-2 ${inputBgClass}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${textMutedClass}`}>Status</span>
                <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1
                  ${connState === 'connected' ? 'text-emerald-500' : 
                    connState === 'failed' || connState === 'disconnected' ? 'text-red-500' : 
                    'text-amber-500'}`}
                >
                  {connState === 'waiting' && <><Loader2 size={12} className="animate-spin" /> Waiting for receiver</>}
                  {connState === 'connecting' && <><Loader2 size={12} className="animate-spin" /> Connecting peers</>}
                  {connState === 'connected' && transferState === 'idle' && <><CheckCircle size={12} /> Connected</>}
                  {transferState === 'transferring' && <><Loader2 size={12} className="animate-spin" /> Transferring</>}
                  {transferState === 'completed' && <><CheckCircle size={12} /> Completed</>}
                  {transferState === 'failed' && <><AlertCircle size={12} /> Failed</>}
                  {transferState === 'cancelled' && <><AlertCircle size={12} /> Cancelled</>}
                  {(connState === 'failed' || connState === 'disconnected') && transferState === 'idle' && <><AlertCircle size={12} /> Disconnected</>}
                </span>
              </div>

              {/* File Info */}
              {(file || fileMeta.current) && (
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-current/10">
                  <FileIcon size={20} style={{ color: accentColor }} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${textClass}`}>{file?.name || fileMeta.current?.name}</p>
                    <p className={`text-xs ${textMutedClass}`}>{formatSize(file?.size || fileMeta.current?.size || 0)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Link Sharing (Sender waiting) */}
            {isSender && connState === 'waiting' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className={`text-lg font-medium truncate ${textClass}`}>{file?.name}</p>
                  <p className={`text-sm ${textMutedClass}`}>{formatSize(file?.size || 0)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1 min-w-0">
                    <a href={getShareLink()} target="_blank" rel="noreferrer" className="text-base sm:text-lg font-mono tracking-tight hover:opacity-80 transition-opacity truncate block" style={{ color: textClass }}>
                      {getShareLink()}
                    </a>
                    <div className="absolute -bottom-1 left-0 w-full h-0.5" style={{ backgroundColor: accentColor }}></div>
                  </div>
                  <button 
                    onClick={copyLink}
                    className="p-2 rounded-lg transition-colors hover:bg-current/10 shrink-0"
                    style={{ color: accentColor }}
                    title="Copy Link"
                  >
                    {copied ? <CheckCircle size={24} /> : <Copy size={24} />}
                  </button>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="bg-white p-2 rounded-lg shrink-0">
                    <QRCodeSVG value={getShareLink()} size={120} />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {/* WhatsApp */}
                    <a href={`https://wa.me/?text=${encodeURIComponent(getShareLink())}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    </a>
                    {/* Facebook */}
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareLink())}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                    {/* Email */}
                    <a href={`mailto:?subject=File Transfer&body=${encodeURIComponent(getShareLink())}`} className="w-10 h-10 rounded-full bg-[#8bc34a] flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </a>
                    {/* Gmail */}
                    <a href={`https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=&su=File+Transfer&body=${encodeURIComponent(getShareLink())}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#e0e0e0] flex items-center justify-center text-[#db4437] hover:scale-110 transition-transform">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </a>
                    {/* LinkedIn */}
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareLink())}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#0A66C2] flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                    {/* Twitter */}
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareLink())}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Receiver Join Button */}
            {!isSender && connState === 'idle' && (
              <button 
                onClick={joinReceiver}
                className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: accentColor, color: '#000' }}
              >
                <Download size={18} /> Accept File
              </button>
            )}

            {/* Progress Bar */}
            {(transferState === 'transferring' || transferState === 'completed') && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className={textClass}>{progress}%</span>
                  <span className={textMutedClass}>{formatSpeed(speed)}</span>
                </div>
                <div className={`h-2 w-full rounded-full overflow-hidden ${isLightMode ? 'bg-slate-200' : 'bg-slate-800'}`}>
                  <div 
                    className="h-full transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%`, backgroundColor: accentColor }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              {(transferState === 'transferring' || connState === 'waiting' || connState === 'connecting') && (
                <button 
                  onClick={cancelTransfer}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                >
                  <Square size={14} /> Cancel
                </button>
              )}
              
              {isSender && (transferState === 'completed' || transferState === 'failed' || transferState === 'cancelled') && (
                <button 
                  onClick={() => {
                    const nextAttempt = attempt + 1;
                    setAttempt(nextAttempt);
                    
                    // Reset local state for new transfer
                    if (dataChannel.current) dataChannel.current.close();
                    if (peerConnection.current) peerConnection.current.close();
                    if (fileReader.current && fileReader.current.readyState === 1) fileReader.current.abort();
                    
                    peerConnection.current = null;
                    dataChannel.current = null;
                    setTransferState('idle');
                    setProgress(0);
                    setSpeed(0);
                    
                    startSender(nextAttempt);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                  style={{ backgroundColor: accentColor, color: '#000' }}
                >
                  <Play size={14} /> Share Again
                </button>
              )}

              {(transferState === 'completed' || transferState === 'failed' || transferState === 'cancelled') && (
                <button 
                  onClick={() => {
                    cleanup();
                    // If receiver, remove query param
                    if (!isSender) {
                      const url = new URL(window.location.href);
                      url.searchParams.delete('transfer');
                      window.history.replaceState({}, '', url.toString());
                      setIsSender(true);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors
                    ${isLightMode ? 'border-slate-300 hover:bg-slate-100' : 'border-white/10 hover:bg-white/5'} ${textClass}`}
                >
                  Done
                </button>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default FileTransfer;

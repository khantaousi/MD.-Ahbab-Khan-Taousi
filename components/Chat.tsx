import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ChatMessage } from '../types';
import { Send, MessageCircle, X } from 'lucide-react';

interface ChatProps {
  accentColor: string;
}

const Chat: React.FC<ChatProps> = ({ accentColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const q = query(collection(db, 'chatMessages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chatMessages');
    });
    return () => unsubscribe();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, 'chatMessages'), {
        sender: 'Visitor',
        text: newMessage,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'chatMessages');
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 z-[100]"
        style={{ backgroundColor: accentColor, color: '#000' }}
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 glass border border-white/10 rounded-[32px] shadow-3xl flex flex-col z-[100] overflow-hidden">
      <div className="p-4 border-b border-white/5 flex justify-between items-center" style={{ backgroundColor: `${accentColor}11` }}>
        <h3 className="font-black text-sm text-white">Live Chat</h3>
        <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white"><X size={18} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.map(msg => (
          <div key={msg.id} className={`text-xs p-3 rounded-2xl ${msg.sender === 'Visitor' ? 'bg-white/10 ml-auto' : 'bg-slate-800'}`}>
            <p className="font-bold mb-1 opacity-50">{msg.sender}</p>
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-white/5 flex gap-2">
        <input 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-cyan-500/30"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="p-2 rounded-xl transition-all" style={{ backgroundColor: accentColor, color: '#000' }}><Send size={16} /></button>
      </div>
    </div>
  );
};

export default Chat;

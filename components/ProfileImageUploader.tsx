import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import smartcrop from 'smartcrop';
import { Camera, Crop as CropIcon, User, Check, X } from 'lucide-react';

interface ProfileImageUploaderProps {
  currentImage: string;
  onImageUpdate: (base64Image: string) => void;
  t: any;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({ currentImage, onImageUpdate, t }) => {
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropping, setIsCropping] = useState(false);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setIsCropping(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  };

  const handleAutoFace = async () => {
    if (imgRef.current) {
      const result = await smartcrop.crop(imgRef.current, { width: 256, height: 256 });
      const topCrop = result.topCrop;
      if (topCrop) {
        setCrop({
          unit: 'px',
          x: topCrop.x,
          y: topCrop.y,
          width: topCrop.width,
          height: topCrop.height,
        });
      }
    }
  };

  const getCroppedImg = () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );

    const base64Image = canvas.toDataURL('image/jpeg');
    onImageUpdate(base64Image);
    setIsCropping(false);
    setImgSrc('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full border-4 border-slate-800 overflow-hidden bg-slate-900 flex-shrink-0">
          {currentImage ? (
            <img src={currentImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <Camera size={32} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <label className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl border border-white/10 font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all inline-flex items-center gap-2">
            <Camera size={16} /> {t.adminUploadImage || "Upload Image"}
            <input type="file" accept="image/*" className="hidden" onChange={onSelectFile} />
          </label>
          <p className="text-slate-500 text-xs mt-2 font-medium">Recommended: Square image, max 2MB</p>
        </div>
      </div>

      {isCropping && !!imgSrc && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <CropIcon size={20} className="text-cyan-400" /> Crop Profile Picture
              </h3>
              <button onClick={() => setIsCropping(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-black/50 rounded-xl overflow-hidden flex items-center justify-center max-h-[60vh]">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-h-[60vh] object-contain"
                />
              </ReactCrop>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button 
                onClick={handleAutoFace}
                className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all"
              >
                <User size={16} /> Auto Face Crop
              </button>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCropping(false)}
                  className="px-6 py-2 rounded-lg font-bold text-sm text-slate-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={getCroppedImg}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2 rounded-lg font-black text-sm flex items-center gap-2 transition-all"
                >
                  <Check size={16} /> Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUploader;

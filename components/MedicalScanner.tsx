
import React, { useRef, useState } from 'react';
import { MedicalImage } from '../types';

interface Props {
  onImageSelected: (img: MedicalImage | null) => void;
}

const MedicalScanner: React.FC<Props> = ({ onImageSelected }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        const medicalImg: MedicalImage = {
          data: base64,
          mimeType: file.type,
          label: file.name
        };
        setPreview(reader.result as string);
        onImageSelected(medicalImg);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-slate-900/60 rounded-xl p-4 border border-dashed border-slate-700 hover:border-cyan-500/50 transition-all group relative overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFile} 
        accept="image/*" 
        className="hidden" 
      />
      
      {!preview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center py-6 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors mb-2">
            <i className="fa-solid fa-cloud-arrow-up text-lg"></i>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300">
            Ingest Visual Grounding (PET/Chart)
          </span>
          <span className="text-[8px] text-slate-600 mt-1">SUPPORTED: JPG, PNG, DICOM_EXPORT</span>
        </div>
      ) : (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
          <img src={preview} className="w-full h-full object-contain opacity-60" alt="Scanner Preview" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[8px] text-cyan-400 font-mono">VISUAL_READY</span>
              <span className="text-[10px] text-slate-300 truncate max-w-[120px]">DATA_SCAN_01.IMG</span>
            </div>
            <button 
              onClick={() => { setPreview(null); onImageSelected(null); }}
              className="p-1 text-rose-400 hover:text-rose-300 transition-colors"
            >
              <i className="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>
          {/* Scanner line animation */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-[scan_3s_linear_infinite]"></div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default MedicalScanner;

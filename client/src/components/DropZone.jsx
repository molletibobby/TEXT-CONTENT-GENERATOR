import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Video, Mic, FileScan, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function DropZone({ onFileUpload, isProcessing, uploadProgress, activeTab }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('english');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const triggerUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile, targetLanguage);
    }
  };

  return (
    <div className="space-y-5">
      {/* Target Language Selection Bar */}
      <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <label className="text-xs font-semibold text-slate-300 flex items-center">
          <Globe className="w-4 h-4 text-indigo-400 mr-2" /> Target Processing Language:
        </label>
        <div className="flex space-x-1.5">
          {[
            { id: 'english', label: 'English' },
            { id: 'telugu', label: 'తెలుగు (Telugu)' },
            { id: 'tinglish', label: 'Tinglish' },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => setTargetLanguage(lang.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                targetLanguage === lang.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Drag and Drop Container */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-indigo-500 bg-indigo-950/20 scale-[0.99]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept={
            activeTab === 'video'
              ? 'video/mp4,video/webm,video/quicktime'
              : activeTab === 'audio'
              ? 'audio/*'
              : activeTab === 'pdf'
              ? 'application/pdf'
              : 'image/*,application/pdf,video/*,audio/*'
          }
        />

        <div className="p-4 bg-indigo-600/10 text-indigo-400 rounded-2xl mb-4 border border-indigo-500/20 shadow-inner">
          <UploadCloud className="w-10 h-10 animate-bounce" />
        </div>

        {selectedFile ? (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-emerald-400 flex items-center justify-center">
              <Check className="w-4 h-4 mr-1" /> Selected: {selectedFile.name}
            </p>
            <p className="text-xs text-slate-400">
              Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Media File'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-base font-semibold text-slate-200">
              Drag and drop your media file here
            </p>
            <p className="text-xs text-slate-400">
              or click to browse from your device
            </p>
          </div>
        )}

        {/* Video Rule Alert Badge */}
        {activeTab === 'video' && (
          <div className="mt-4 flex items-center space-x-1.5 text-[11px] bg-amber-950/40 text-amber-300 border border-amber-800/50 px-3 py-1 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Strict Rule: Video clips must be under 29 seconds</span>
          </div>
        )}
      </div>

      {/* Progress Bar & Processing Indicator */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center text-indigo-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Processing Media Pipeline...
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Start Processing Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          triggerUpload();
        }}
        disabled={!selectedFile || isProcessing}
        className={`w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg ${
          !selectedFile || isProcessing
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
            : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white hover:shadow-indigo-500/25'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>{isProcessing ? 'Processing Ingestion...' : 'Run Multimodal Engine'}</span>
      </button>
    </div>
  );
}

function Globe(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

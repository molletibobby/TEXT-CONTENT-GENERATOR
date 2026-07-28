import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Video, Mic, FileScan, History, Cpu, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import DropZone from './components/DropZone';
import WorkspaceOutput from './components/WorkspaceOutput';
import HistoryPanel from './components/HistoryPanel';
import { uploadMedia } from './services/api';

export default function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('ocr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeResult, setActiveResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch((err) => console.error('API health check error:', err));
  }, []);

  const handleFileUpload = async (file, targetLanguage) => {
    setIsProcessing(true);
    setUploadProgress(10);
    setErrorMessage(null);

    try {
      const response = await uploadMedia(file, targetLanguage, 'summary', (progress) => {
        setUploadProgress(progress);
      });

      if (response.data) {
        setActiveResult(response.data);
      }
    } catch (err) {
      console.error('File upload processing error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to process media file.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-[#0d1322] px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              AI Multimodal Studio
            </h1>
            <p className="text-xs text-slate-400">Offline OCR • Audio • Video (≤29s) • Telugu/Tinglish LLM</p>
          </div>
        </div>

        {/* System Health Status Indicator */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-medium">Backend:</span>
            {healthStatus ? (
              <span className="flex items-center text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Online
              </span>
            ) : (
              <span className="flex items-center text-amber-400 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 mr-1 animate-pulse" /> Offline / Connecting
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-[#0b101d] border-b border-slate-800/80 px-6 pt-3 flex space-x-2 overflow-x-auto">
        {[
          { id: 'ocr', label: 'Image to Text (OCR)', icon: FileText },
          { id: 'pdf', label: 'Scanner PDF', icon: FileScan },
          { id: 'video', label: 'Video (≤29s)', icon: Video },
          { id: 'audio', label: 'Audio Transcript', icon: Mic },
          { id: 'history', label: 'Upload History', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setErrorMessage(null);
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#131b2e] text-indigo-400 border-t-2 border-indigo-500 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Alert Message */}
      {errorMessage && (
        <div className="max-w-7xl w-full mx-auto px-6 pt-4">
          <div className="bg-rose-950/60 border border-rose-800 text-rose-200 p-4 rounded-xl flex items-center justify-between text-xs shadow-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white font-bold">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload / History Panel */}
        <section className="lg:col-span-6 bg-[#131b2e] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          {activeTab === 'history' ? (
            <div>
              <h2 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
                <History className="w-5 h-5 text-indigo-400 mr-2" /> Upload & Processing History
              </h2>
              <p className="text-xs text-slate-400 mb-6">Review previously ingested images, PDFs, videos, and transcripts.</p>
              <HistoryPanel onSelectJob={(job) => setActiveResult(job)} />
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                Ingestion & Multimodal Engine
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Upload your file to perform offline OCR, audio extraction, transcription, and English/Telugu AI summarization.
              </p>
              <DropZone
                onFileUpload={handleFileUpload}
                isProcessing={isProcessing}
                uploadProgress={uploadProgress}
                activeTab={activeTab}
              />
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Offline AI Pipeline</span>
            <span className="text-indigo-400 font-mono">Tesseract • Whisper • Ollama</span>
          </div>
        </section>

        {/* Right Column: AI Output & Multilingual Workspace */}
        <section className="lg:col-span-6 bg-[#131b2e] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <WorkspaceOutput result={activeResult} />
        </section>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { Copy, Download, Check, FileText, Sparkles, Languages } from 'lucide-react';

export default function WorkspaceOutput({ result }) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
        <Sparkles className="w-12 h-12 text-slate-700 mb-3" />
        <p className="text-sm font-medium text-slate-400">No output generated yet</p>
        <p className="text-xs text-slate-600 mt-1 max-w-xs">
          Upload an image, PDF, audio, or video clip to view OCR extractions, Whisper transcripts, and AI summaries here.
        </p>
      </div>
    );
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'text') {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } else {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const downloadFile = (filename, content) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header Info Bar */}
      <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-300 font-semibold uppercase border border-indigo-800/50">
            {result.fileType}
          </span>
          <span className="text-slate-400 truncate max-w-[200px]">{result.originalName}</span>
        </div>
        {result.confidenceScore && (
          <span className="text-emerald-400 font-mono flex items-center bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/50">
            Confidence: {result.confidenceScore.toFixed(0)}%
          </span>
        )}
      </div>

      {/* Extracted Text Pane */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center">
            <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Extracted Raw Text / Transcript
          </h3>
          <button
            onClick={() => copyToClipboard(result.extractedText, 'text')}
            className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-indigo-400 transition-colors"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? 'Copied!' : 'Copy Raw Text'}</span>
          </button>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
          {result.extractedText || 'No text detected.'}
        </div>
      </div>

      {/* AI Summary / Multilingual Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> AI Summary & Translation ({result.targetLanguage})
          </h3>
          <button
            onClick={() => copyToClipboard(result.aiSummary, 'summary')}
            className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
          </button>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed border-l-4 border-l-emerald-500">
          {result.aiSummary || 'AI Summary pending.'}
        </div>
      </div>

      {/* Download Action Buttons */}
      <div className="pt-2 flex items-center justify-end space-x-3">
        <button
          onClick={() => downloadFile(`${result.originalName}_extracted.txt`, result.extractedText)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all border border-slate-700"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download TXT</span>
        </button>
        <button
          onClick={() => downloadFile(`${result.originalName}_summary.txt`, `EXTRACTED TEXT:\n${result.extractedText}\n\n====================\nAI SUMMARY (${result.targetLanguage}):\n${result.aiSummary}`)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download PDF/Doc Bundle</span>
        </button>
      </div>
    </div>
  );
}

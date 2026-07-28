import React, { useEffect, useState } from 'react';
import { fetchHistory, deleteHistoryItem } from '../services/api';
import { History, Trash2, FileText, Video, Mic, FileScan, Calendar } from 'lucide-react';

export default function HistoryPanel({ onSelectJob }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await fetchHistory();
      if (res.data && res.data.jobs) {
        setHistoryItems(res.data.jobs);
      }
    } catch (err) {
      console.error('Failed to load upload history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteHistoryItem(id);
      setHistoryItems(historyItems.filter((item) => item._id !== id));
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'video': return Video;
      case 'audio': return Mic;
      case 'pdf': return FileScan;
      default: return FileText;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-xs animate-pulse">Loading Upload History...</div>;
  }

  if (historyItems.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
        <History className="w-8 h-8 text-slate-700 mx-auto mb-2" />
        No processing history recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
      {historyItems.map((item) => {
        const Icon = getIcon(item.fileType);
        return (
          <div
            key={item._id}
            onClick={() => onSelectJob(item)}
            className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
          >
            <div className="flex items-center space-x-3 truncate">
              <div className="p-2.5 bg-indigo-600/10 text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-semibold text-slate-200 truncate">{item.originalName}</h4>
                <p className="text-[11px] text-slate-400 flex items-center mt-0.5 space-x-2">
                  <span className="capitalize">{item.fileType}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={(e) => handleDelete(e, item._id)}
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Delete item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

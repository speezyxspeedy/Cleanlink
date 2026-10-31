import React, { useState } from 'react';
import { HistoryItem, formatTimeAgo } from '../lib/history';
import { Copy, Check, Trash2, ArrowUpRight, History, Sparkles } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectUrl: (url: string) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  onCopy: (text: string, label: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelectUrl,
  onDeleteItem,
  onClearHistory,
  onCopy
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyClean = (item: HistoryItem) => {
    onCopy(item.cleanUrl, 'Clean URL');
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Recent History
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            ({history.length}/10)
          </span>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-slate-500 hover:text-rose-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
            title="Clear all recent history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear history</span>
          </button>
        )}
      </div>

      {/* History Items List */}
      {history.length === 0 ? (
        <div className="py-8 text-center text-slate-400 space-y-1">
          <p className="text-xs">No links cleaned yet in this session.</p>
          <p className="text-[11px] text-slate-400">
            Paste or test a URL above to start building your recent history.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map((item) => (
            <div
              key={item.id}
              className="group p-3 rounded-lg border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition-all space-y-2"
            >
              {/* Row 1: Domain, Savings, and Time */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 text-xs">
                    {item.domain}
                  </span>
                  <span className="text-slate-300">·</span>
                  {item.savedCharacters > 0 ? (
                    <span className="text-emerald-700 font-mono font-medium text-[11px]">
                      Saved {item.savedCharacters}c ({item.savedPercent}%)
                    </span>
                  ) : (
                    <span className="text-slate-500 font-mono text-[11px]">
                      Already clean
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  {formatTimeAgo(item.timestamp)}
                </span>
              </div>

              {/* Row 2: Clean URL (truncated) */}
              <div
                onClick={() => onSelectUrl(item.cleanUrl)}
                title="Click to load in playground"
                className="font-mono text-xs text-slate-700 hover:text-indigo-600 truncate cursor-pointer select-all"
              >
                {item.cleanUrl}
              </div>

              {/* Row 3: Quick Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyClean(item)}
                    className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copy clean URL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onSelectUrl(item.cleanUrl)}
                    className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ArrowUpRight className="w-3 h-3 text-slate-500" />
                    <span>Load</span>
                  </button>
                </div>

                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-white transition-colors cursor-pointer"
                  title="Remove from history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

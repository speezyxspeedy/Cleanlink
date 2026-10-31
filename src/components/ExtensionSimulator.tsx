import React, { useState } from 'react';
import { CleanResult } from '../lib/cleaner';
import { CleanLinkLogo } from './CleanLinkLogo';
import { Copy, FileText, Share2, Check } from 'lucide-react';

interface ExtensionSimulatorProps {
  result: CleanResult;
  pageTitle: string;
  onCopy: (text: string, label: string) => void;
}

export const ExtensionSimulator: React.FC<ExtensionSimulatorProps> = ({
  result,
  pageTitle,
  onCopy
}) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleCopyAction = (text: string, label: string) => {
    onCopy(text, label);
    setToastMsg(`${label} copied!`);
    setTimeout(() => {
      setToastMsg(null);
    }, 1800);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto">
      {/* Extension Window Frame */}
      <div className="relative rounded-xl border border-slate-300 bg-white shadow-md overflow-hidden text-slate-800">
        {/* Window Chrome Titlebar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200 bg-slate-100/80">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-600 pl-1">Extension Popup Preview</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
              Alt+Shift+C
            </span>
          </div>
        </div>

        {/* Extension Popup Content */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
              <CleanLinkLogo size={20} />
              <span>CleanLink</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              v1.0.0
            </span>
          </div>

          {/* Savings Metric Banner */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50/80 border border-emerald-200/80">
            <div className="text-xs text-slate-700">
              {result.savedCharacters > 0 ? (
                <span>Saved <strong className="text-emerald-700 font-mono font-medium">{result.savedCharacters}</strong> characters of junk</span>
              ) : (
                <span>URL is already clean & private</span>
              )}
            </div>
            <div className="text-xs font-mono font-semibold text-emerald-700">
              {result.savedCharacters > 0 ? `-${result.savedPercent}%` : '0 junk'}
            </div>
          </div>

          {/* Clean URL Output */}
          <div className="rounded-lg bg-slate-50 border border-indigo-200/80 p-2.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-indigo-700 font-medium uppercase tracking-wider">
              <span>Clean Destination Link</span>
              <span className="font-mono text-slate-500">{result.cleanUrl.length} chars</span>
            </div>
            <div className="font-mono text-xs text-slate-900 break-all select-all leading-relaxed line-clamp-3 bg-white p-2 rounded border border-slate-200">
              {result.cleanUrl || 'Paste a URL to see cleaned output'}
            </div>
          </div>

          {/* Original Bloated URL (Diff) */}
          {result.savedCharacters > 0 && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                <span>Original Bloated URL</span>
                <span className="font-mono text-rose-600">{result.originalUrl.length} chars</span>
              </div>
              <div className="font-mono text-[11px] text-slate-500 line-through decoration-rose-500/60 break-all line-clamp-2">
                {result.originalUrl}
              </div>
            </div>
          )}

          {/* Stripped Parameters Badges */}
          {result.removedParams.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Stripped Tracking Tokens</span>
                <span className="font-mono text-slate-700 font-medium">({result.removedParams.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                {result.removedParams.map((p, idx) => (
                  <span
                    key={idx}
                    title={`${p.key}: ${p.description}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px]"
                  >
                    <span className="text-rose-500">✕</span>
                    <span>{p.key}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 3 Quick Action Copy Buttons */}
          <div className="pt-2 space-y-1.5">
            <button
              onClick={() => handleCopyAction(result.cleanUrl, 'Clean URL')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Clean URL</span>
              </div>
              <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                ↵ Enter
              </span>
            </button>

            <button
              onClick={() => handleCopyAction(result.markdownLink, 'Markdown Link')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Markdown Link</span>
              </div>
              <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                M
              </span>
            </button>

            <button
              onClick={() => handleCopyAction(result.shortUrl, 'Short Link')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Short Link</span>
              </div>
              <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                S
              </span>
            </button>
          </div>

          {/* Shortcut note */}
          <div className="pt-1 text-center text-[10.5px] text-slate-500">
            Press <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-700">Alt+Shift+C</kbd> to clean & copy
          </div>
        </div>

        {/* In-Frame Toast */}
        {toastMsg && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs shadow-md animate-fade-in pointer-events-none">
            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};

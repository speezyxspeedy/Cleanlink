import React, { useState } from 'react';
import { cleanUrl, CleanResult } from '../lib/cleaner';
import { Trash2, Copy, Check, ListFilter } from 'lucide-react';

interface BatchUrlCleanerProps {
  onCopy: (text: string, label: string) => void;
}

const DEFAULT_BATCH_INPUT = `https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=trackingToken123&feature=share
https://www.amazon.com/dp/B09XS7JWHH?ref=sr_1_3&keywords=headphones&tag=affiliate-20
https://x.com/techfeed/status/1785315837382947120?s=20&t=4bW7v9k
https://newsletter.example.com/issue-42?utm_source=email&utm_medium=newsletter&mc_cid=abc1234
https://www.reddit.com/r/technology/comments/18z7g9q/sample_topic/?utm_source=share&utm_medium=web3x`;

export const BatchUrlCleaner: React.FC<BatchUrlCleanerProps> = ({ onCopy }) => {
  const [inputText, setInputText] = useState(DEFAULT_BATCH_INPUT);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const lines = inputText.split('\n').filter(line => line.trim().length > 0);
  const cleanedResults: CleanResult[] = lines.map(line => cleanUrl(line.trim()));

  const totalSavedChars = cleanedResults.reduce((acc, r) => acc + r.savedCharacters, 0);
  const totalOriginalChars = cleanedResults.reduce((acc, r) => acc + r.originalUrl.length, 0);
  const percentSaved = totalOriginalChars > 0 ? Math.round((totalSavedChars / totalOriginalChars) * 100) : 0;

  const handleCopyAllClean = () => {
    const allClean = cleanedResults.map(r => r.cleanUrl).join('\n');
    onCopy(allClean, 'All clean URLs');
    setCopiedLabel('clean');
    setTimeout(() => setCopiedLabel(null), 1800);
  };

  const handleCopyMarkdownList = () => {
    const markdownList = cleanedResults
      .map(r => `- [${r.domain || 'Link'}](${r.cleanUrl})`)
      .join('\n');
    onCopy(markdownList, 'Markdown list');
    setCopiedLabel('markdown');
    setTimeout(() => setCopiedLabel(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Input container */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Batch URL Sanitizer
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste multiple links (one per line) from emails, chats, or bookmarks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInputText('')}
              className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste URLs one per line..."
          className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-lg p-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600/30 transition-all"
        />

        {/* Aggregated Savings Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-700">
              Processed <strong className="text-slate-900 font-mono">{cleanedResults.length}</strong> links
            </div>
            <span className="text-slate-300">·</span>
            <div className="text-xs text-emerald-700 font-mono font-semibold tabular-nums">
              {totalSavedChars} junk characters stripped ({percentSaved}%)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAllClean}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLabel === 'clean' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Clean URLs</span>
            </button>
            <button
              onClick={handleCopyMarkdownList}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLabel === 'markdown' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ListFilter className="w-3.5 h-3.5 text-slate-500" />}
              <span>Copy Markdown List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cleaned Links List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
          Cleaned URL Results ({cleanedResults.length})
        </h4>

        <div className="space-y-2">
          {cleanedResults.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-400">#{idx + 1}</span>
                  <span className="text-xs font-semibold text-slate-800">{item.domain}</span>
                </div>
                <div className="text-xs font-mono tabular-nums text-emerald-700 font-medium">
                  {item.savedCharacters > 0 ? `-${item.savedCharacters}c` : 'Already clean'}
                </div>
              </div>

              <div className="font-mono text-xs text-slate-800 break-all select-all">
                {item.cleanUrl}
              </div>

              {item.removedParams.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {item.removedParams.map((p, pIdx) => (
                    <span
                      key={pIdx}
                      className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]"
                    >
                      ✕ {p.key}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

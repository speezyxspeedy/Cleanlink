import React from 'react';
import { CleanResult } from '../lib/cleaner';
import {
  ShieldCheck,
  Trash2,
  ExternalLink,
  Clipboard,
  Check,
  FileCode,
  Layers,
  Link2
} from 'lucide-react';

export interface PresetUrl {
  name: string;
  category: string;
  title: string;
  url: string;
}

export const PRESET_URLS: PresetUrl[] = [
  {
    name: 'YouTube Video',
    category: 'Video',
    title: 'Building Modern Web Applications',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=c4bN9Z7u8QxXqL1P&feature=share&pp=ygUIcmljayByb2xs&t=42s'
  },
  {
    name: 'Amazon Product',
    category: 'E-Commerce',
    title: 'Noise Cancelling Wireless Headphones',
    url: 'https://www.amazon.com/Sony-WH-1000XM5-Canceling-Headphones-Hands-Free/dp/B09XS7JWHH/ref=sr_1_3?crid=3B63WTYR8B291&keywords=sony+wh1000xm5&qid=1689240180&sprefix=sony%2Caps%2C189&sr=8-3&tag=affiliatejunk-20&linkCode=ll1'
  },
  {
    name: 'X / Twitter Post',
    category: 'Social',
    title: 'Paul Graham on Product Craft',
    url: 'https://x.com/paulg/status/1785315837382947120?s=20&t=4bW7v9kXyZ1_sampleToken&ref_src=twsrc%5Etfw'
  },
  {
    name: 'Mailchimp Newsletter',
    category: 'Marketing',
    title: 'Weekly Tech Digest #241',
    url: 'https://techdigest.io/articles/future-of-dev-tools?utm_source=weekly_newsletter&utm_medium=email&utm_campaign=digest_241&utm_content=hero_cta&mc_cid=8a7c29e102&mc_eid=5f9038ba12'
  },
  {
    name: 'AliExpress Item',
    category: 'Retail',
    title: 'Precision Screwdriver Set 64-in-1',
    url: 'https://www.aliexpress.com/item/1005004829374012.html?spm=a2g0o.productlist.main.1.28c949c8tFw42G&algo_pvid=7b0e1189-9a29-4b67&scm=1007.40000.329782.0&pdp_npi=4%40dis%21USD%2114.99%219.99'
  },
  {
    name: 'Reddit Post',
    category: 'Community',
    title: 'What developer tool changed your life?',
    url: 'https://www.reddit.com/r/webdev/comments/18z7g9q/what_developer_tool_changed_your_workflow/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&rdt=49201'
  },
  {
    name: 'Spotify Track',
    category: 'Audio',
    title: 'Midnight City - M83',
    url: 'https://open.spotify.com/track/1eyzqe2QqGZUmfcPZtrIyt?si=7d3824bc294a4c51&utm_source=copy-link'
  }
];

interface UrlDissectorProps {
  inputUrl: string;
  onUrlChange: (url: string) => void;
  result: CleanResult;
  pageTitle: string;
  onTitleChange: (title: string) => void;
  onCopy: (text: string, label: string) => void;
}

export const UrlDissector: React.FC<UrlDissectorProps> = ({
  inputUrl,
  onUrlChange,
  result,
  pageTitle,
  onTitleChange,
  onCopy
}) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleCopy = (text: string, key: string, label: string) => {
    onCopy(text, label);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onUrlChange(text.trim());
      }
    } catch {
      // Browser permissions
    }
  };

  const loadPreset = (preset: PresetUrl) => {
    onUrlChange(preset.url);
    onTitleChange(preset.title);
  };

  return (
    <div className="space-y-6">
      {/* Input Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Enter or Paste URL
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePaste}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5 text-slate-500" />
              <span>Paste from clipboard</span>
            </button>
            {inputUrl && (
              <button
                onClick={() => onUrlChange('')}
                className="px-2 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        <div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="Paste bloated URL (YouTube, Amazon, Twitter, newsletter...)"
            className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-lg px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600/30 transition-all"
          />
        </div>

        {/* Quick Test Presets */}
        <div className="pt-1 space-y-2">
          <span className="text-[11px] font-medium text-slate-500">
            Quick Examples:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_URLS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => loadPreset(preset)}
                className={`px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer ${
                  inputUrl === preset.url
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Output & Savings */}
      {result.isValid && (
        <div className="space-y-4">
          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Tracking Stripped</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600">
                  {result.savedCharacters}
                </span>
                <span className="text-xs text-slate-500">characters</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500 font-mono">
                {result.savedCharacters > 0 ? `-${result.savedPercent}% payload size` : 'Already clean'}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Privacy Status</div>
              <div className="mt-1 flex items-center gap-1.5 text-emerald-700 font-medium text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{result.removedParams.length > 0 ? 'Protected & Clean' : 'Clean Link'}</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {result.removedParams.length} surveillance tokens removed
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Platform Rule</div>
              <div className="mt-1 flex items-center gap-1.5 text-slate-900 font-semibold text-sm">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>{result.platformBadge || 'Standard Web'}</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500 font-mono truncate">
                {result.domain}
              </div>
            </div>
          </div>

          {/* Clean URL Output card */}
          <div className="bg-white rounded-xl border border-indigo-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Sanitized Clean Link
                </h3>
              </div>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {result.cleanUrl.length} characters
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-sm text-slate-900 break-all select-all leading-relaxed">
              {result.cleanUrl}
            </div>

            {/* Quick Action Copy Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => handleCopy(result.cleanUrl, 'clean', 'Clean URL')}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {copiedKey === 'clean' ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                <span>Copy Clean URL</span>
              </button>

              <button
                onClick={() => handleCopy(result.markdownLink, 'markdown', 'Markdown Link')}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-200 text-slate-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'markdown' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileCode className="w-3.5 h-3.5 text-slate-500" />}
                <span>Copy Markdown</span>
              </button>

              <button
                onClick={() => handleCopy(result.shortUrl, 'short', 'Short Link')}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-200 text-slate-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'short' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5 text-slate-500" />}
                <span>Copy Short Link</span>
              </button>
            </div>
          </div>

          {/* Removed parameters table */}
          {result.removedParams.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Stripped Tracking Parameters ({result.removedParams.length})
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Identified & removed
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-medium">
                      <th className="py-2 pr-3 font-mono">Parameter</th>
                      <th className="py-2 px-3">Description & Tracking Type</th>
                      <th className="py-2 pl-3 font-mono">Original Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {result.removedParams.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 pr-3 text-rose-600 font-semibold flex items-center gap-1">
                          <span>✕</span>
                          <span>{p.key}</span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-700">
                          {p.description}
                        </td>
                        <td className="py-2.5 pl-3 text-slate-500 truncate max-w-[200px]">
                          {p.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

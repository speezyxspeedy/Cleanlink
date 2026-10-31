import React from 'react';
import { Download, FolderCheck, Keyboard } from 'lucide-react';

interface InstallGuideProps {
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const InstallGuide: React.FC<InstallGuideProps> = ({
  onDownloadZip,
  isDownloading
}) => {
  return (
    <div className="space-y-6">
      {/* Hero CTA for Download */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900">
            Install CleanLink into Google Chrome
          </h3>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Download the pre-packaged Manifest V3 extension folder. No build commands or dependencies required.
          </p>
        </div>

        <button
          onClick={onDownloadZip}
          disabled={isDownloading}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Packaging...' : 'Download Extension (.zip)'}</span>
        </button>
      </div>

      {/* 4-Step Process */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-semibold flex items-center justify-center">
              1
            </span>
            <h4 className="text-sm font-semibold text-slate-900">
              Open Chrome Extensions Page
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            In your Chrome browser, type this into your URL bar:
          </p>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-indigo-700 select-all">
            chrome://extensions/
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-semibold flex items-center justify-center">
              2
            </span>
            <h4 className="text-sm font-semibold text-slate-900">
              Turn on Developer Mode
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Toggle the <strong className="text-slate-900">Developer mode</strong> switch in the top-right corner to <strong className="text-emerald-700">ON</strong>.
          </p>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">Developer mode</span>
            <div className="w-9 h-5 bg-indigo-600 rounded-full flex items-center justify-end px-1">
              <div className="w-3.5 h-3.5 bg-white rounded-full shadow-xs" />
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-semibold flex items-center justify-center">
              3
            </span>
            <h4 className="text-sm font-semibold text-slate-900">
              Click &quot;Load unpacked&quot;
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Click the <strong className="text-slate-900">Load unpacked</strong> button and select the unzipped <code className="text-indigo-700 font-mono">extension</code> folder.
          </p>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <FolderCheck className="w-4 h-4 text-indigo-600" />
            <span>Folder includes manifest.json, popup.html, cleaner.js</span>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-semibold flex items-center justify-center">
              4
            </span>
            <h4 className="text-sm font-semibold text-slate-900">
              Clean with Global Shortcut
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Press the shortcut on any web page to strip tracking tokens and copy clean link:
          </p>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-600 font-medium">Default shortcut</span>
            <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 text-xs font-mono text-slate-800 font-medium shadow-2xs">
              Alt + Shift + C
            </kbd>
          </div>
        </div>
      </div>

      {/* Shortcut configuration info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Rebinding the Shortcut in Chrome
          </h4>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          To rebind the shortcut to another key combination:
        </p>
        <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 pl-1">
          <li>Visit <code className="text-indigo-700 font-mono">chrome://extensions/shortcuts</code> in Chrome.</li>
          <li>Find <strong className="text-slate-800">CleanLink & Instant Share</strong>.</li>
          <li>Click the pen icon next to <em>Clean current tab URL and copy to clipboard</em>.</li>
          <li>Type your custom hotkey (e.g., <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200">Option+Shift+C</kbd> or <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200">Alt+C</kbd>).</li>
        </ol>
      </div>
    </div>
  );
};

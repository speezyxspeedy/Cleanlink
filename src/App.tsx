import React, { useState, useEffect } from 'react';
import { cleanUrl, CleanResult } from './lib/cleaner';
import {
  getCleanHistory,
  saveToCleanHistory,
  deleteHistoryItem,
  clearCleanHistory,
  HistoryItem
} from './lib/history';
import { PRESET_URLS, UrlDissector } from './components/UrlDissector';
import { ExtensionSimulator } from './components/ExtensionSimulator';
import { HistoryPanel } from './components/HistoryPanel';
import { BatchUrlCleaner } from './components/BatchUrlCleaner';
import { CodeInspector } from './components/CodeInspector';
import { InstallGuide } from './components/InstallGuide';
import { generateExtensionZip, triggerDownload } from './lib/zipExporter';
import { CleanLinkLogo } from './components/CleanLinkLogo';
import {
  Download,
  Check,
  Zap,
  History,
  Layers,
  FileCode,
  BookOpen
} from 'lucide-react';

type NavTab = 'playground' | 'history' | 'batch' | 'code' | 'install';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('playground');
  const [currentUrl, setCurrentUrl] = useState<string>(PRESET_URLS[0].url);
  const [pageTitle, setPageTitle] = useState<string>(PRESET_URLS[0].title);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on initial mount
  useEffect(() => {
    const loaded = getCleanHistory();
    setHistory(loaded);
  }, []);

  // Compute clean link metrics
  const cleanResult: CleanResult = cleanUrl(currentUrl, pageTitle);

  // Automatically save to history whenever a valid URL is loaded or cleaned
  useEffect(() => {
    if (cleanResult?.isValid && cleanResult?.cleanUrl) {
      const updated = saveToCleanHistory(cleanResult);
      setHistory(updated);
    }
  }, [cleanResult.cleanUrl]);

  const showGlobalToast = (message: string) => {
    setToastNotification(message);
    setTimeout(() => {
      setToastNotification(null);
    }, 2200);
  };

  const copyToClipboard = async (text: string, label: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showGlobalToast(`${label} copied to clipboard!`);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showGlobalToast(`${label} copied to clipboard!`);
    }
  };

  // Keyboard shortcut listener for Alt+Shift+C in the web playground
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.code === 'KeyC')) {
        e.preventDefault();
        if (cleanResult?.cleanUrl) {
          copyToClipboard(cleanResult.cleanUrl, 'Clean URL');
          showGlobalToast(`Alt+Shift+C: Clean link copied! (-${cleanResult.savedCharacters} chars)`);
          const updated = saveToCleanHistory(cleanResult);
          setHistory(updated);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cleanResult]);

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const blob = await generateExtensionZip();
      triggerDownload(blob, 'CleanLink-Extension-v1.0.0.zip');
      showGlobalToast('CleanLink extension (.zip) downloaded!');
    } catch (err) {
      console.error('Failed to generate zip:', err);
      showGlobalToast('Failed to create extension package');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSelectHistoryUrl = (url: string) => {
    setCurrentUrl(url);
    setActiveTab('playground');
    showGlobalToast('Loaded link into playground');
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    const updated = clearCleanHistory();
    setHistory(updated);
    showGlobalToast('History cleared');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (concise single-line nav) - Zone 3 (1 primary CTA) */}
      <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 lg:px-12 py-3.5 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <CleanLinkLogo size={28} />
          <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
            CleanLink
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('playground')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
              activeTab === 'playground' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Playground
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            <span>History</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] font-mono text-slate-600">
              {history.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
              activeTab === 'batch' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Batch Sanitizer
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
              activeTab === 'code' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Extension Files
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
              activeTab === 'install' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Chrome Setup
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Packaging...' : 'Download Extension (.zip)'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header / Intro Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Manifest V3</span>
              <span aria-hidden="true">·</span>
              <span>Zero Dependencies</span>
              <span aria-hidden="true">·</span>
              <span>Local Storage Enabled</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              CleanLink & Instant Share
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Strip tracking parameters (UTMs, fbclid, ref, si) and share clean, private links.
            </p>
          </div>

          {/* Shortcut reminder */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Shortcut in Chrome</div>
              <div className="text-xs font-mono font-semibold text-slate-800">
                Alt + Shift + C
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs for Mobile */}
        <div className="flex md:hidden items-center gap-1 p-1 bg-white rounded-lg border border-slate-200 overflow-x-auto shadow-xs">
          <button
            onClick={() => setActiveTab('playground')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'playground' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Playground
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            History ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'batch' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Batch
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'install' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            Setup
          </button>
        </div>

        {/* Tab 1: Playground & Recent History */}
        {activeTab === 'playground' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 cols: Interactive Dissector & Inputs */}
            <div className="lg:col-span-7 space-y-6">
              <UrlDissector
                inputUrl={currentUrl}
                onUrlChange={setCurrentUrl}
                result={cleanResult}
                pageTitle={pageTitle}
                onTitleChange={setPageTitle}
                onCopy={copyToClipboard}
              />
            </div>

            {/* Right 5 cols: Local Storage History Panel & Extension Preview */}
            <div className="lg:col-span-5 space-y-6">
              {/* Local Storage History Component (Last 10 cleaned URLs) */}
              <HistoryPanel
                history={history}
                onSelectUrl={handleSelectHistoryUrl}
                onDeleteItem={handleDeleteHistoryItem}
                onClearHistory={handleClearHistory}
                onCopy={copyToClipboard}
              />

              {/* Extension Simulator Preview */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-800 uppercase tracking-wider px-1">
                  Extension Popup Preview
                </div>
                <ExtensionSimulator
                  result={cleanResult}
                  pageTitle={pageTitle}
                  onCopy={copyToClipboard}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dedicated History View */}
        {activeTab === 'history' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <HistoryPanel
              history={history}
              onSelectUrl={handleSelectHistoryUrl}
              onDeleteItem={handleDeleteHistoryItem}
              onClearHistory={handleClearHistory}
              onCopy={copyToClipboard}
            />
          </div>
        )}

        {/* Tab 3: Batch URL Sanitizer */}
        {activeTab === 'batch' && (
          <BatchUrlCleaner onCopy={copyToClipboard} />
        )}

        {/* Tab 4: Extension Files Code Inspector */}
        {activeTab === 'code' && (
          <CodeInspector onCopy={copyToClipboard} />
        )}

        {/* Tab 5: Chrome Developer Mode Setup Guide */}
        {activeTab === 'install' && (
          <InstallGuide
            onDownloadZip={handleDownloadZip}
            isDownloading={isDownloading}
          />
        )}
      </main>

      {/* Global Toast Floating Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white font-medium text-xs shadow-lg animate-bounce-short">
          <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="mt-16 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>CleanLink & Instant Share · Lightweight Chrome Extension · Runs 100% locally with zero analytics</p>
      </footer>
    </div>
  );
}

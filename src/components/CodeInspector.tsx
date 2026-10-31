import React, { useState } from 'react';
import { EXTENSION_FILES, ExtensionFileDefinition } from '../lib/extensionFiles';
import { Copy, Check, FileCode } from 'lucide-react';

interface CodeInspectorProps {
  onCopy: (text: string, label: string) => void;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({ onCopy }) => {
  const [activeFile, setActiveFile] = useState<ExtensionFileDefinition>(EXTENSION_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    onCopy(activeFile.content, activeFile.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const lineCount = activeFile.content.split('\n').length;
  const byteCount = new Blob([activeFile.content]).size;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* File Navigation Tabs Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-4 pt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
          {EXTENSION_FILES.map((file) => (
            <button
              key={file.name}
              onClick={() => setActiveFile(file)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeFile.name === file.name
                  ? 'bg-white text-indigo-700 font-semibold shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-slate-500" />
              <span>{file.name}</span>
            </button>
          ))}
        </div>

        {/* Copy Button & Metrics */}
        <div className="flex items-center gap-3 pb-2">
          <span className="text-[11px] font-mono text-slate-500">
            {lineCount} lines · {byteCount} B
          </span>
          <button
            onClick={handleCopyCode}
            className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy File'}</span>
          </button>
        </div>
      </div>

      {/* File Description Header */}
      <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <span>{activeFile.description}</span>
        <span className="font-mono text-[10px] text-slate-500 uppercase">{activeFile.language}</span>
      </div>

      {/* Code Editor Preview Area */}
      <div className="p-4 bg-slate-900 overflow-x-auto max-h-[520px]">
        <pre className="font-mono text-xs text-slate-100 leading-relaxed">
          <code>{activeFile.content}</code>
        </pre>
      </div>
    </div>
  );
};

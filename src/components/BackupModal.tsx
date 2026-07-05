/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Share2, Copy, Check, Download, FileJson, AlertCircle } from 'lucide-react';
import { GroceryItem } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GroceryItem[];
}

export default function BackupModal({ isOpen, onClose, items }: BackupModalProps) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(items, null, 2);

  // 1. Share via Web Share API (Flawless on real Android/iOS devices!)
  const handleShare = async () => {
    setErrorMsg(null);
    try {
      if (!navigator.share) {
        setErrorMsg('Web Sharing is not supported on this browser/environment. Try copying to clipboard!');
        return;
      }

      const fileName = `grocery_list_backup_${new Date().toISOString().split('T')[0]}.json`;
      const file = new File([jsonString], fileName, { type: 'application/json' });

      // Check if file sharing is supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'LocalCart Backup',
          text: 'My LocalCart Grocery List Backup',
        });
      } else {
        // Fallback to text sharing if file sharing is not allowed/supported
        await navigator.share({
          title: 'LocalCart Backup',
          text: jsonString,
        });
      }
    } catch (err: any) {
      console.error('Share failed:', err);
      if (err.name !== 'AbortError') {
        setErrorMsg(`Sharing failed: ${err.message || 'Unknown error'}`);
      }
    }
  };

  // 2. Copy to Clipboard (Great backup/fallback)
  const handleCopyToClipboard = async () => {
    setErrorMsg(null);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = jsonString;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      setErrorMsg('Could not copy to clipboard automatically.');
    }
  };

  // 3. Reliable Blob File Download
  const handleDownloadFile = () => {
    setErrorMsg(null);
    try {
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      downloadAnchor.setAttribute('download', `grocery_list_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download failed:', err);
      setErrorMsg('File download failed. Please use Share or Copy to Clipboard.');
    }
  };

  const isShareSupported = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div 
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-xl border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-500/10 text-teal-600 rounded-xl">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-slate-900 font-extrabold text-sm tracking-tight leading-none">Export Backup</h2>
              <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">Save your grocery items</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto no-scrollbar">
          <p className="text-xs text-slate-500 leading-relaxed text-center">
            Since some mobile environments block direct downloads, choose the most convenient way to backup your <strong>{items.length}</strong> items:
          </p>

          {/* Share option (Primary on mobile) */}
          {isShareSupported ? (
            <button
              onClick={handleShare}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2.5 shadow-sm active:scale-98 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Share Backup File
            </button>
          ) : (
            <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold">Web Share unavailable in preview container</span>
            </div>
          )}

          {/* Grid for alternative copy & download */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyToClipboard}
              className={`py-3 px-3 border font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer ${
                copied 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-600' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>

            <button
              onClick={handleDownloadFile}
              className="py-3 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Download File
            </button>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-amber-50 border border-amber-100/60 rounded-xl flex items-start gap-1.5 text-amber-800 text-[10px] leading-normal font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Preview block */}
          <div className="mt-1">
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block mb-1.5 text-center">JSON Backup Preview</span>
            <div className="bg-slate-900 rounded-2xl p-3 font-mono text-[9px] text-teal-400 overflow-x-auto max-h-[120px] shadow-inner select-all leading-normal border border-slate-800">
              <pre>{jsonString.length > 500 ? `${jsonString.substring(0, 500)}\n  ...\n}` : jsonString}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex justify-center bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 py-1.5 px-4 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

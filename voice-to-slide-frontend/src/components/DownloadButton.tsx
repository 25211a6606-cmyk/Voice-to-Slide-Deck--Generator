'use client';

import React, { useState } from 'react';
import { Download, ChevronDown, FileText, Check, Loader2 } from 'lucide-react';
import { ExportFormat } from '@/services/types';
import { apiService } from '@/services/api';
import { useToast } from './Toast';

interface DownloadButtonProps {
  deckId?: string;
  pptUrl?: string;
  defaultFormat?: ExportFormat;
  variant?: 'primary' | 'secondary' | 'compact';
}

export default function DownloadButton({
  deckId = 'deck-101',
  pptUrl,
  defaultFormat = 'pptx',
  variant = 'primary',
}: DownloadButtonProps) {
  const { showToast } = useToast();
  const [format, setFormat] = useState<ExportFormat>(defaultFormat);
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const formatLabels: Record<ExportFormat, { title: string; desc: string; ext: string }> = {
    pptx: { title: 'PowerPoint (.pptx)', desc: 'Full vector slides & speaker notes', ext: 'pptx' },
    pdf: { title: 'PDF Document (.pdf)', desc: 'High-res printable slide document', ext: 'pdf' },
    markdown: { title: 'Markdown (.md)', desc: 'Plain text outline for Notion/Docs', ext: 'md' },
  };

  const handleDownload = async () => {
    setIsExporting(true);
    showToast(`Preparing ${formatLabels[format].title} export...`, 'info');

    try {
      const result = await apiService.exportDeck(deckId, format, pptUrl);
      
      // Trigger browser download
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Successfully downloaded ${result.fileName}!`, 'success');
    } catch {
      showToast('Export failed. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleDownload}
        disabled={isExporting}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors flex items-center gap-1.5"
      >
        {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        <span>Download .{formatLabels[format].ext}</span>
      </button>
    );
  }

  return (
    <div className="relative inline-block text-left w-full sm:w-auto">
      <div className="flex items-center gap-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 p-1 rounded-2xl shadow-xl shadow-violet-600/30">
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-white bg-transparent hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
              <span>Generating {format.toUpperCase()}...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-cyan-300" />
              <span>Export Presentation ({format.toUpperCase()})</span>
            </>
          )}
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 text-white transition-colors border-l border-white/10"
          aria-label="Select export format"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Format Selection Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel p-2 border border-slate-700 shadow-2xl z-40 animate-fade-in">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5">Select Export Format</div>
          {(['pptx', 'pdf', 'markdown'] as ExportFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => {
                setFormat(fmt);
                setIsOpen(false);
              }}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-start gap-3 ${
                format === fmt ? 'bg-violet-950/80 border border-violet-500/50' : 'hover:bg-slate-900/60'
              }`}
            >
              <FileText className={`w-5 h-5 mt-0.5 ${format === fmt ? 'text-cyan-400' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>{formatLabels[fmt].title}</span>
                  {format === fmt && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{formatLabels[fmt].desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

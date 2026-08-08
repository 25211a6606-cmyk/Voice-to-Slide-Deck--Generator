'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DownloadButton from '@/components/DownloadButton';
import { apiService } from '@/services/api';
import { PresentationDeck } from '@/services/types';
import { FileText, CheckCircle2, Presentation, Share2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function DownloadPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [deck, setDeck] = useState<PresentationDeck | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDeck(apiService.getDeckFromStorage());
  }, []);

  const handleCopyShareLink = () => {
    if (!deck) return;
    navigator.clipboard.writeText(`https://voicetoslide.ai/p/${deck.id}`);
    setCopiedLink(true);
    showToast('Presentation share link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // SSR Safe Loading state to ensure zero React hydration mismatches
  if (!mounted || !deck) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Preparing Presentation Export...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Banner Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Step 3 of 3: Export Complete</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Your Presentation is Ready
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Download your slides in PowerPoint PPTX, PDF document, or Markdown format.
        </p>
      </div>

      {/* Main Download Action Hero Box */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-violet-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Presentation className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-100">{deck.title}</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{deck.summary}</p>
        </div>

        {/* Primary Download CTA Component */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <DownloadButton deckId={deck.id} pptUrl={deck.pptUrl} defaultFormat="pptx" variant="primary" />
        </div>

        <div className="pt-2 flex items-center justify-center gap-4">
          <button
            onClick={handleCopyShareLink}
            className="text-xs font-semibold text-slate-300 hover:text-slate-100 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Copy Presentation Share Link'}</span>
          </button>
        </div>
      </div>

      {/* Metadata & Deck Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 text-center space-y-1">
          <div className="text-2xl font-extrabold text-violet-400">{deck.slides.length}</div>
          <div className="text-xs text-slate-400 font-medium">Total Slides</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 text-center space-y-1">
          <div className="text-2xl font-extrabold text-cyan-400">{deck.duration}</div>
          <div className="text-xs text-slate-400 font-medium">Speech Duration</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 text-center space-y-1">
          <div className="text-2xl font-extrabold text-emerald-400">100%</div>
          <div className="text-xs text-slate-400 font-medium">Speaker Notes</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 text-center space-y-1">
          <div className="text-2xl font-extrabold text-pink-400">Vector</div>
          <div className="text-xs text-slate-400 font-medium">PPTX Layout</div>
        </div>
      </div>

      {/* Slide Outline Summary */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-400" />
            <span>Slide Deck Structure Outline</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">{deck.slides.length} Slides Rendered</span>
        </div>

        <div className="space-y-3">
          {deck.slides.map((s) => (
            <div key={s.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-4">
              <span className="w-7 h-7 rounded-lg bg-violet-950 text-violet-300 border border-violet-800/50 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                #{s.id}
              </span>
              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-bold text-slate-200">{s.title}</h4>
                <p className="text-xs text-slate-400">{s.keyTakeaway}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Return Actions */}
      <div className="flex items-center justify-between pt-4">
        <Link
          href="/preview"
          className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Preview & Edit</span>
        </Link>

        <Link
          href="/upload"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800 flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Upload Another Audio File</span>
        </Link>
      </div>
    </div>
  );
}

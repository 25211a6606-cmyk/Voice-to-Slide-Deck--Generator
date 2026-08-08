'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TranscriptView from '@/components/TranscriptView';
import SlideCard from '@/components/SlideCard';
import DownloadButton from '@/components/DownloadButton';
import { apiService } from '@/services/api';
import { PresentationDeck, SlideItem } from '@/services/types';
import { Presentation, Sparkles, ArrowRight, RefreshCw, Send } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function PreviewPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [deck, setDeck] = useState<PresentationDeck | null>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<number>(1);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [activeTab, setActiveTab] = useState<'split' | 'slides' | 'transcript'>('split');

  useEffect(() => {
    setMounted(true);
    setDeck(apiService.getDeckFromStorage());
  }, []);

  const handleUpdateSlide = (updatedSlide: SlideItem) => {
    if (!deck) return;
    const updatedDeck = {
      ...deck,
      slides: deck.slides.map((s) => (s.id === updatedSlide.id ? updatedSlide : s)),
    };
    setDeck(updatedDeck);
    apiService.saveDeckToStorage(updatedDeck);
  };

  const handleRefineAi = async () => {
    if (!aiPrompt.trim()) {
      showToast('Please enter an AI prompt to refine slides.', 'warning');
      return;
    }
    if (!deck) return;

    setIsRefining(true);
    showToast(`Applying AI instruction: "${aiPrompt}"...`, 'info');

    try {
      const fullPrompt = `USER REFINEMENT INSTRUCTION: "${aiPrompt}"\n\nORIGINAL TRANSCRIPT:\n${deck.transcript[0]?.text || deck.title}`;
      const res = await apiService.generateSlides(fullPrompt);
      if (res.data && res.data.slides && res.data.slides.length > 0) {
        const themes: SlideItem['theme'][] = ['gradient', 'dark', 'neon', 'minimal'];
        const updatedSlides: SlideItem[] = res.data.slides.map((s, idx) => ({
          id: idx + 1,
          title: s.title || `Slide ${idx + 1}`,
          subtitle: s.subtitle || '',
          bulletPoints: s.bullets || [],
          keyTakeaway: s.bullets?.[0] || '',
          speakerNotes: s.speakerNotes || '',
          theme: themes[idx % themes.length],
          visualType: 'bullets',
        }));
        const updatedDeck = {
          ...deck,
          title: res.data.presentationTitle || deck.title,
          slideCount: updatedSlides.length,
          slides: updatedSlides,
          pptUrl: res.data.pptUrl || deck.pptUrl,
        };
        setDeck(updatedDeck);
        apiService.saveDeckToStorage(updatedDeck);
        showToast('AI successfully refined presentation slides!', 'success');
      } else {
        showToast('AI completed refinement.', 'info');
      }
    } catch (err: any) {
      console.error('AI Refinement Error:', err);
      showToast(err.message || 'AI refinement failed.', 'error');
    } finally {
      setIsRefining(false);
      setAiPrompt('');
    }
  };

  // SSR Safe Loading state to ensure zero React hydration mismatches
  if (!mounted || !deck) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Loading AI Presentation Deck...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Navigation Stepper */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step 2 of 3: AI Preview & Editor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            {deck.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {deck.summary}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <DownloadButton deckId={deck.id} variant="compact" />
          <Link
            href="/download"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-600/30 flex items-center gap-2"
          >
            <span>Proceed to Export</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center justify-between bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('split')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'split' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Split View (Transcript + Slides)
          </button>
          <button
            onClick={() => setActiveTab('slides')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'slides' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Slide Gallery ({deck.slides.length})
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'transcript' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Full Transcript
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 pr-2 font-mono">
          <span>Duration: {deck.duration}</span>
          <span>•</span>
          <span>Slides: {deck.slides.length}</span>
        </div>
      </div>

      {/* AI Refinement Input Bar */}
      <div className="glass-panel rounded-2xl p-3 border border-violet-500/30 flex items-center gap-3 shadow-lg">
        <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 ml-2 animate-pulse" />
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Ask AI to refine slides (e.g., 'Make slide #2 more concise', 'Add a chart recommendation')..."
          className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={handleRefineAi}
          disabled={isRefining}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors flex items-center gap-1.5 shrink-0"
        >
          {isRefining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>{isRefining ? 'Refine' : 'Apply AI Prompt'}</span>
        </button>
      </div>

      {/* Main Content Layout */}
      {activeTab === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Transcript (Span 5) */}
          <div className="lg:col-span-5 h-[620px]">
            <TranscriptView transcript={deck.transcript} />
          </div>

          {/* Right: Slide Cards Grid (Span 7) */}
          <div className="lg:col-span-7 space-y-4 max-h-[620px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Presentation className="w-4 h-4 text-violet-400" />
                <span>Generated Slide Deck ({deck.slides.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">Click slide to edit or zoom</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {deck.slides.map((slide) => (
                <SlideCard
                  key={slide.id}
                  slide={slide}
                  totalSlides={deck.slides.length}
                  isActive={selectedSlideId === slide.id}
                  onSelect={() => setSelectedSlideId(slide.id)}
                  onUpdateSlide={handleUpdateSlide}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'slides' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deck.slides.map((slide) => (
            <SlideCard
              key={slide.id}
              slide={slide}
              totalSlides={deck.slides.length}
              isActive={selectedSlideId === slide.id}
              onSelect={() => setSelectedSlideId(slide.id)}
              onUpdateSlide={handleUpdateSlide}
            />
          ))}
        </div>
      )}

      {activeTab === 'transcript' && (
        <div className="max-w-4xl mx-auto h-[600px]">
          <TranscriptView transcript={deck.transcript} />
        </div>
      )}
    </div>
  );
}

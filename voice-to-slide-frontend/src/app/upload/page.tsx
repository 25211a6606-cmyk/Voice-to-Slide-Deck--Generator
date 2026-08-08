'use client';

import React, { useState } from 'react';
import UploadCard from '@/components/UploadCard';
import { Sliders, Mic, HelpCircle } from 'lucide-react';

export default function UploadPage() {
  const [language, setLanguage] = useState('en-US');
  const [deckStyle, setDeckStyle] = useState('executive');
  const [slideCount, setSlideCount] = useState('5');
  const [extractSpeakerNotes, setExtractSpeakerNotes] = useState(true);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Heading */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-800/60 text-xs font-semibold text-violet-300">
          <Mic className="w-3.5 h-3.5 text-cyan-400" />
          <span>Step 1 of 3: Speech Audio Input</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Upload Voice File or Record Live
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Upload meeting audio, lectures, or voice memos to synthesize into structured slides.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Upload Card Component (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <UploadCard requestedSlideCount={parseInt(slideCount, 10) || 5} />
        </div>

        {/* Right Column: AI Configuration Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-slate-100">AI Slide Settings</h3>
            </div>

            {/* Language Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Audio Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="en-US">English (United States)</option>
                <option value="es-ES">Spanish (Español)</option>
                <option value="fr-FR">French (Français)</option>
                <option value="de-DE">German (Deutsch)</option>
              </select>
            </div>

            {/* Presentation Deck Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Presentation Archetype</label>
              <select
                value={deckStyle}
                onChange={(e) => setDeckStyle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="executive">Executive Summary (Concise & Bold)</option>
                <option value="technical">Technical Architecture (Deep Detail)</option>
                <option value="pitch">Investor Pitch Deck (Impact Driven)</option>
                <option value="academic">Academic Lecture (Educational)</option>
              </select>
            </div>

            {/* Desired Target Slide Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Target Slide Count</label>
              <select
                value={slideCount}
                onChange={(e) => setSlideCount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-semibold"
              >
                <option value="3">3 Slides (Brief Pitch)</option>
                <option value="5">5 Slides (Quick Brief)</option>
                <option value="8">8 Slides (Standard Deck)</option>
                <option value="10">10 Slides (Extended Overview)</option>
                <option value="12">12 Slides (Comprehensive)</option>
              </select>
            </div>

            {/* Checkbox toggles */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={extractSpeakerNotes}
                  onChange={(e) => setExtractSpeakerNotes(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500"
                />
                <span>Auto-generate Speaker Delivery Notes</span>
              </label>
            </div>
          </div>

          {/* Quick FAQ Helper */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 space-y-3 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Tips for Best Results</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed">
              <li>Ensure clear microphone audio with minimal background noise.</li>
              <li>Pause slightly between major topics for accurate slide division.</li>
              <li>Recordings under 10 minutes process fastest (&lt; 20 seconds).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

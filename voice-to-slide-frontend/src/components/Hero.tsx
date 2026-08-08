'use client';

import React from 'react';
import Link from 'next/link';
import { Mic, Sparkles, ArrowRight, Play, Presentation, FileCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      {/* Glow Backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/20 via-indigo-500/20 to-cyan-400/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-violet-500/30 backdrop-blur-md shadow-inner text-xs font-semibold text-violet-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Next-Gen Voice to Presentation AI</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight leading-[1.15]">
            Turn Your Spoken Spells into{' '}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Executive Slide Decks
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Upload voice notes, audio recordings, or lectures. Our AI transcribes your speech, extracts core topics, and generates formatted PowerPoint presentation slides in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/upload"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 transition-all duration-300 shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 hover:scale-105"
            >
              <Mic className="w-4 h-4" />
              <span>Upload Audio Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/preview"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
              <span>Explore Demo Preview</span>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-xl font-bold text-violet-400">80%</div>
              <div className="text-xs text-slate-400 font-medium">Faster Prep Time</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-xl font-bold text-cyan-400">&lt; 30s</div>
              <div className="text-xs text-slate-400 font-medium">Processing Speed</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-xl font-bold text-emerald-400">PPTX + PDF</div>
              <div className="text-xs text-slate-400 font-medium">Direct Export</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="text-xl font-bold text-pink-400">Speaker Notes</div>
              <div className="text-xs text-slate-400 font-medium">AI Auto-Generated</div>
            </div>
          </div>
        </div>

        {/* Visual Mock Banner */}
        <div className="mt-14 relative max-w-4xl mx-auto rounded-2xl glass-panel p-4 border border-violet-500/20 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs text-slate-400 ml-2 font-mono">voice-to-slide-editor.v1</span>
            </div>
            <span className="text-xs text-violet-400 font-semibold bg-violet-950/60 px-2.5 py-0.5 rounded-md border border-violet-800/50">
              Live Mock Simulation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Mock: Voice Waveform */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-violet-400" /> Audio Transcript Input
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">04:15 Recorded</span>
              </div>
              <p className="text-xs text-slate-400 italic mb-4 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                &quot;Traditionally, creating slides takes hours... With our AI pipeline, voice recordings are transcribed into structured presentation decks.&quot;
              </p>
              {/* Simulated Waveform */}
              <div className="flex items-center justify-between gap-1 h-8 px-2 bg-slate-900 rounded-lg">
                {[40, 70, 30, 85, 50, 95, 60, 40, 80, 100, 45, 90, 70, 35, 65, 80, 50, 90, 40].map((h, idx) => (
                  <div
                    key={idx}
                    className="w-1 bg-gradient-to-t from-violet-600 to-cyan-400 rounded-full animate-pulse"
                    style={{ height: `${h}%`, animationDelay: `${idx * 0.1}s` }}
                  />
                ))}
              </div>
            </div>

            {/* Right Mock: Generated Slide Preview */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950/80 border border-indigo-500/30 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Presentation className="w-4 h-4 text-cyan-400" /> Slide 1 of 5 Generated
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/50">
                  Ready to Export
                </span>
              </div>

              <div className="space-y-2 py-2">
                <h4 className="text-sm font-bold text-slate-100">AI-Powered Automation</h4>
                <p className="text-[11px] text-violet-300">Transform Spoken Voice into Executive Decks</p>
                <ul className="text-[10px] text-slate-300 space-y-1 list-disc list-inside pt-1">
                  <li>Automatic voice audio transcription</li>
                  <li>Extract key points & speaker notes</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                <span>Theme: Gradient Violet</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <FileCheck className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

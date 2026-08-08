'use client';

import React from 'react';
import Link from 'next/link';
import Hero from '@/components/Hero';
import { Upload, Cpu, Presentation, Sparkles, ArrowRight, Zap, Layers, FileCheck } from 'lucide-react';

export default function HomePage() {
  const steps = [
    {
      num: '01',
      title: 'Upload Speech Audio',
      desc: 'Drop your meeting recordings, voice notes, or lecture files (.mp3, .wav, .m4a) or record live via your mic.',
      icon: Upload,
      gradient: 'from-violet-600 to-indigo-600',
    },
    {
      num: '02',
      title: 'AI Topic Extraction',
      desc: 'Our engine transcribes your speech, synthesizes key topics, structures hierarchy, and writes speaker notes.',
      icon: Cpu,
      gradient: 'from-indigo-600 to-cyan-500',
    },
    {
      num: '03',
      title: 'Export Vector Decks',
      desc: 'Preview slide templates, edit bullet text, and download instantly in PowerPoint PPTX or PDF format.',
      icon: Presentation,
      gradient: 'from-cyan-500 to-emerald-500',
    },
  ];

  const features = [
    {
      title: 'High-Precision Speech Parsing',
      desc: 'Handles fast speech, technical terminology, and multi-speaker conversations with high fidelity transcription.',
      icon: Zap,
    },
    {
      title: 'Automatic Speaker Notes',
      desc: 'Generates detailed context notes for every slide so you never stumble during your live delivery.',
      icon: Layers,
    },
    {
      title: 'Multi-Theme Slide Styles',
      desc: 'Switch between Dark Slate, Gradient Indigo, and Neon Cyan visual themes with a single click.',
      icon: Sparkles,
    },
    {
      title: 'Instant PPTX & PDF Export',
      desc: 'Fully compatible with Microsoft PowerPoint, Google Slides, Keynote, and PDF readers.',
      icon: FileCheck,
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Landing Hero Section */}
      <Hero />

      {/* Workflow Steps Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            How VoiceToSlide Works
          </h2>
          <p className="text-sm text-slate-400">
            Three simple steps to transform raw spoken audio into an executive presentation deck.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="glass-panel glass-panel-hover rounded-3xl p-8 relative flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${step.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-extrabold text-slate-700 font-mono group-hover:text-violet-400 transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Matrix Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-950/80 border border-violet-800/50 flex items-center justify-center text-violet-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">{feat.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-violet-900/60 via-indigo-900/60 to-cyan-900/60 border border-violet-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to create slides from your voice?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Skip hours of slide formatting. Upload your audio file or record live speech to generate your presentation now.
            </p>

            <div className="pt-4">
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 transition-all shadow-xl shadow-violet-600/30 hover:scale-105"
              >
                <span>Get Started - Upload Audio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

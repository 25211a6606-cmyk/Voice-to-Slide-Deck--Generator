'use client';

import React, { useState } from 'react';
import { SlideItem } from '@/services/types';
import { Edit3, FileText, Check, ChevronDown, Sparkles, Maximize2, X } from 'lucide-react';
import { useToast } from './Toast';

interface SlideCardProps {
  slide: SlideItem;
  totalSlides?: number;
  isActive?: boolean;
  onSelect?: () => void;
  onUpdateSlide?: (updatedSlide: SlideItem) => void;
}

export default function SlideCard({ slide, totalSlides, isActive = false, onSelect, onUpdateSlide }: SlideCardProps) {
  const { showToast } = useToast();
  const [showNotes, setShowNotes] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [title, setTitle] = useState(slide.title);
  const [subtitle, setSubtitle] = useState(slide.subtitle || '');
  const [theme, setTheme] = useState(slide.theme);

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (onUpdateSlide) {
      onUpdateSlide({
        ...slide,
        title,
        subtitle,
        theme,
      });
    }
    showToast(`Slide #${slide.id} changes saved`, 'success');
  };

  const themeStyles = {
    gradient: 'bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border-indigo-500/40 text-slate-100',
    dark: 'bg-slate-950 border-slate-800 text-slate-100',
    neon: 'bg-gradient-to-br from-slate-900 via-cyan-950/60 to-slate-950 border-cyan-500/40 text-slate-100',
    minimal: 'bg-slate-900/90 border-slate-700/80 text-slate-100',
  };

  return (
    <>
      <div
        onClick={onSelect}
        className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between relative group ${
          themeStyles[theme]
        } ${isActive ? 'ring-2 ring-violet-500 shadow-xl shadow-violet-950/40' : 'hover:border-slate-600'}`}
      >
        {/* Header Badges */}
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-600/30 border border-violet-500/50 flex items-center justify-center text-xs font-extrabold text-violet-300 font-mono">
              #{slide.id}
            </span>
            <span className="text-xs font-semibold text-slate-400 capitalize bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              {theme} Theme
            </span>
          </div>

          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(!isEditing);
              }}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Edit Slide Text"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(true);
              }}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Full Screen Preview"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Slide Content Body */}
        {isEditing ? (
          <div className="space-y-3 py-2" onClick={(e) => e.stopPropagation()}>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Slide Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as SlideItem['theme'])}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
              >
                <option value="gradient">Gradient Indigo</option>
                <option value="dark">Dark Slate</option>
                <option value="neon">Neon Cyan</option>
                <option value="minimal">Minimal Slate</option>
              </select>
            </div>
            <button
              onClick={handleSaveEdit}
              className="w-full py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-3 my-2">
            <div>
              <h3 className="text-lg font-bold text-slate-100 tracking-tight leading-snug">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-violet-300 font-medium mt-0.5">{subtitle}</p>
              )}
            </div>

            {/* Visual Highlight or Bullet Points */}
            {slide.visualType === 'stat' && slide.statNumber ? (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center my-2">
                <div className="text-3xl font-extrabold text-cyan-400">{slide.statNumber}</div>
                <div className="text-[11px] text-slate-400 font-medium">{slide.statLabel}</div>
              </div>
            ) : (
              <ul className="space-y-1.5 text-xs text-slate-300">
                {slide.bulletPoints.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Key Takeaway Box */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300">
              <span className="font-semibold text-violet-400 block mb-0.5">Key Takeaway:</span>
              {slide.keyTakeaway}
            </div>
          </div>
        )}

        {/* Speaker Notes Footer Drawer */}
        <div className="border-t border-slate-800/80 pt-2.5 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNotes(!showNotes);
            }}
            className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5 text-violet-400" />
              <span>Speaker Notes</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showNotes ? 'rotate-180 text-violet-400' : ''
              }`}
            />
          </button>

          {showNotes && (
            <p className="text-[11px] text-slate-400 italic bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 mt-2 animate-fade-in leading-relaxed">
              {slide.speakerNotes}
            </p>
          )}
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className={`w-full max-w-4xl max-h-[85vh] rounded-3xl p-8 border shadow-2xl overflow-y-auto ${themeStyles[theme]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-violet-600 text-white font-extrabold text-sm">
                  Slide {slide.id} of {totalSlides || '?'}
                </span>
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Presentation Fullscreen View
                </span>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 max-w-2xl mx-auto py-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">{slide.title}</h1>
                {slide.subtitle && (
                  <p className="text-base text-violet-300 font-semibold mt-1">{slide.subtitle}</p>
                )}
              </div>

              <ul className="space-y-3 text-sm sm:text-base text-slate-200">
                {slide.bulletPoints.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-violet-500/30">
                <p className="text-xs font-bold text-violet-400 uppercase mb-1">Speaker Notes</p>
                <p className="text-sm text-slate-300 italic">{slide.speakerNotes}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

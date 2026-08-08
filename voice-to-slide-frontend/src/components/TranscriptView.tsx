'use client';

import React, { useState } from 'react';
import { TranscriptSegment } from '@/services/types';
import { FileText, Search, Copy, Check, Sparkles, Clock, User } from 'lucide-react';
import { useToast } from './Toast';

interface TranscriptViewProps {
  transcript: TranscriptSegment[];
  onSegmentClick?: (segment: TranscriptSegment) => void;
}

export default function TranscriptView({ transcript, onSegmentClick }: TranscriptViewProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const filteredTranscript = transcript.filter(
    (item) =>
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyTranscript = () => {
    const fullText = transcript
      .map((t) => `[${t.startTime} - ${t.endTime}] ${t.speaker}: ${t.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    showToast('Full transcript copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col h-full space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-violet-400" />
          <h3 className="text-base font-bold text-slate-100">Speech Transcript</h3>
          <span className="text-[10px] bg-violet-950/80 text-violet-300 px-2 py-0.5 rounded border border-violet-800/50">
            {transcript.length} Segments
          </span>
        </div>

        <button
          onClick={handleCopyTranscript}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy All'}</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transcript by keyword or speaker..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-colors"
        />
      </div>

      {/* Transcript Items List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[420px]">
        {filteredTranscript.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No matching transcript segments found.
          </div>
        ) : (
          filteredTranscript.map((segment) => {
            const isActive = activeId === segment.id;
            return (
              <div
                key={segment.id}
                onClick={() => {
                  setActiveId(segment.id);
                  if (onSegmentClick) onSegmentClick(segment);
                }}
                className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-violet-950/40 border-violet-500/60 shadow-lg'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{segment.speaker}</span>
                    {segment.isKeyPoint && (
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800/40 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Key Topic
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{segment.startTime} - {segment.endTime}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{segment.text}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

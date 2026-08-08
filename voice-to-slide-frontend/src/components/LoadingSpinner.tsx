'use client';

import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  sublabel?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  label = 'Processing...',
  sublabel,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-center p-6">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-violet-600/30 blur-xl animate-pulse" />
        <Loader2 className={`${sizeClasses[size]} text-violet-400 animate-spin relative z-10`} />
        <Sparkles className="w-4 h-4 text-cyan-400 absolute z-20 animate-bounce" />
      </div>

      {label && (
        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-100 bg-gradient-to-r from-slate-100 via-violet-200 to-cyan-200 bg-clip-text text-transparent">
            {label}
          </p>
          {sublabel && <p className="text-xs text-slate-400 max-w-xs">{sublabel}</p>}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}

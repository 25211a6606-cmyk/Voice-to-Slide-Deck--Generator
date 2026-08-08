'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Mic, FileAudio, Sparkles, Check, RefreshCw, Volume2, ShieldAlert } from 'lucide-react';
import { PRESET_SAMPLE_AUDIOS } from '@/services/presetData';
import { apiService } from '@/services/api';
import { useToast } from './Toast';
import X402PaywallModal from './X402PaywallModal';

interface UploadCardProps {
  onProcessComplete?: () => void;
  requestedSlideCount?: number;
}

export default function UploadCard({ onProcessComplete, requestedSlideCount = 5 }: UploadCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef<number>(0);

  const [rawFile, setRawFile] = useState<File | null>(null);
  const [selectedFileDetails, setSelectedFileDetails] = useState<{ name: string; size: string; duration: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setRawFile(file);
      setSelectedFileDetails({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        duration: 'Analyzing...',
      });
      showToast(`Selected file: ${file.name}`, 'info');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRawFile(file);
      setSelectedFileDetails({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        duration: 'Analyzing...',
      });
      showToast(`Attached file: ${file.name}`, 'success');
    }
  };

  const handleSelectPreset = async (sample: typeof PRESET_SAMPLE_AUDIOS[0]) => {
    try {
      showToast(`Loading sample audio: ${sample.name}...`, 'info');
      const response = await fetch(`/samples/${sample.id}.wav`);
      if (!response.ok) throw new Error('Failed to load sample audio file');
      const blob = await response.blob();
      const audioFile = new File([blob], `${sample.id}.wav`, { type: 'audio/wav' });
      setRawFile(audioFile);
      setSelectedFileDetails({
        name: sample.name,
        size: `${(blob.size / (1024 * 1024)).toFixed(2)} MB`,
        duration: `${Math.floor(sample.duration / 60).toString().padStart(2, '0')}:${(sample.duration % 60).toString().padStart(2, '0')}`,
      });
      showToast(`Loaded sample audio: ${sample.name}`, 'success');
    } catch (err) {
      console.error('Failed to load preset audio:', err);
      showToast('Failed to load sample audio. Please upload a file instead.', 'error');
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        recordingStartRef.current = Date.now();

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const durationSecs = Math.round((Date.now() - recordingStartRef.current) / 1000);
          const durationStr = `${Math.floor(durationSecs / 60).toString().padStart(2, '0')}:${(durationSecs % 60).toString().padStart(2, '0')}`;
          const micFile = new File([audioBlob], `Live_Recording_${Date.now()}.webm`, { type: 'audio/webm' });
          setRawFile(micFile);
          setSelectedFileDetails({
            name: micFile.name,
            size: `${(audioBlob.size / (1024 * 1024)).toFixed(2)} MB`,
            duration: durationStr,
          });
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());
          showToast('Recording captured successfully!', 'success');
        };

        mediaRecorder.start();
        setIsRecording(true);
        showToast('Recording started... Speak into your microphone', 'info');
      } catch (err) {
        console.error('Microphone access denied:', err);
        showToast('Microphone access denied. Please allow microphone permission.', 'error');
      }
    } else {
      setIsRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    }
  };

  const handleTriggerPaymentGateway = () => {
    if (!selectedFileDetails || !rawFile) {
      showToast('Please select or record an audio file first.', 'warning');
      return;
    }
    // Show x402 Algorand Payment Gateway Modal
    setShowPaywallModal(true);
  };

  const handleConfirmPaywallPayment = async (payerAddress: string, txResult?: any) => {
    setShowPaywallModal(false);
    if (!rawFile) return;

    setIsProcessing(true);
    showToast('Submitting x402 Algorand Payment Proof to Gateway (Port 4021)...', 'info');

    try {
      const result = await apiService.processAudioPipeline(
        rawFile,
        payerAddress,
        txResult?.x402ProofHeader,
        requestedSlideCount
      );
      showToast('x402 Algorand Payment Verified! Transcribed & Generated Slide Deck.', 'success');

      if (onProcessComplete) onProcessComplete();
      router.push('/preview');
    } catch (err: any) {
      console.error('[x402 Pipeline Processing Error]', err);
      showToast(`Error processing x402 payment proof: ${err.message || err}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-panel glass-panel-hover rounded-2xl p-8 text-center cursor-pointer border-2 border-dashed transition-all duration-300 ${
          selectedFileDetails
            ? 'border-violet-500/60 bg-violet-950/20'
            : 'border-slate-800 hover:border-violet-500/40 bg-slate-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-violet-600/30 to-cyan-500/30 flex items-center justify-center mb-4 border border-violet-500/30">
          <Upload className="w-8 h-8 text-violet-400" />
        </div>

        <h3 className="text-lg font-bold text-slate-100 mb-1">
          Drag & Drop your audio file here
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Supports MP3, WAV, M4A, AAC up to 50MB
        </p>

        <button
          type="button"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-violet-300 bg-violet-950/60 border border-violet-800/50 hover:bg-violet-900/50 transition-colors inline-flex items-center gap-2"
        >
          <FileAudio className="w-4 h-4" />
          <span>Browse File from Computer</span>
        </button>
      </div>

      {/* Live Mic Recorder Box */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Live Voice Recorder</h4>
            <p className="text-xs text-slate-400">
              {isRecording ? 'Recording audio in progress...' : 'Record directly via your microphone'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleRecording}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            isRecording
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          {isRecording ? 'Stop & Save' : 'Start Recording'}
        </button>
      </div>

      {/* Selected File Details Box */}
      {selectedFileDetails && (
        <div className="glass-panel rounded-2xl p-4 border border-violet-500/40 bg-violet-950/20 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center">
              <FileAudio className="w-5 h-5 text-violet-300" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">{selectedFileDetails.name}</h4>
              <p className="text-xs text-slate-400">
                {selectedFileDetails.size} • {selectedFileDetails.duration} duration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 font-medium bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Ready
            </span>
          </div>
        </div>
      )}

      {/* Preset Sample Audio Selector */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Or try preset audio samples:</span>
          <span className="text-[11px] text-violet-400">Instant AI Preview</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_SAMPLE_AUDIOS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectPreset(sample)}
              className="p-3 rounded-xl glass-panel text-left hover:border-violet-500/40 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-violet-300 transition-colors truncate">
                  {sample.name.split(' (')[0]}
                </span>
                <Volume2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2">{sample.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={handleTriggerPaymentGateway}
        disabled={isProcessing || !selectedFileDetails}
        className={`w-full py-4 rounded-xl font-bold text-sm text-white shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
          isProcessing || !selectedFileDetails
            ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-violet-600/30 hover:scale-[1.01]'
        }`}
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
            <span>Processing via Algorand x402 Gateway...</span>
          </>
        ) : (
          <>
            <ShieldAlert className="w-4 h-4 text-cyan-300" />
            <span>Generate Slides (x402 Algorand Gateway)</span>
          </>
        )}
      </button>

      {/* x402 Algorand Payment Gateway Modal Component */}
      <X402PaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        onConfirmPayment={handleConfirmPaywallPayment}
        endpoint="POST /generateSlides"
        price="$0.01 USD (1000 microAlgos)"
        walletAddress="ZDZ4KU5CGG5FAHDALMMGJ27AN6BQ7CGTZV5HY2P5EGFHHHUFLDSRJHZZDE"
      />
    </div>
  );
}

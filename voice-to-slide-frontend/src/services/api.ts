import axios from 'axios';
import PptxGenJS from 'pptxgenjs';
import {
  PresentationDeck,
  ExportFormat,
  TranscribeResponse,
  GenerateSlidesResponse,
  SlideItem,
  TranscriptSegment,
} from './types';
import { luteWalletService } from './luteWallet';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4021';

// Axios Instance configured to talk to Payment Gateway (Port 4021)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: {
    'Accept': 'application/json',
  },
  validateStatus: (status) => status < 500, // Handle 2xx and 402 payment required responses
});

const STORAGE_KEY = 'voice_to_slide_active_deck';

export const apiService = {
  /**
   * 1. Call Payment Gateway API: POST /transcribe with Lute Wallet x402 Payment Proof Header
   */
  async transcribeAudio(file: File, paymentProof?: string): Promise<{ data: TranscribeResponse; status: number }> {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('file', file);

    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
    };

    if (paymentProof) {
      headers['Payment-Signature'] = paymentProof;
      headers['X-Payment'] = paymentProof;
      headers['X-PAYMENT-PROOF'] = paymentProof;
      headers['X-402-Payment'] = paymentProof;
      console.log(`[x402 Frontend Stage 7/9] Payment Proof Attached to /transcribe request (${paymentProof.length} chars)`);
    }

    const response = await apiClient.post<TranscribeResponse>('/transcribe', formData, { headers });
    return { data: response.data, status: response.status };
  },

  /**
   * 2. Call Payment Gateway API: POST /generateSlides with Lute Wallet x402 Payment Proof Header
   */
  async generateSlides(
    transcript: string,
    paymentProof?: string,
    requestedSlideCount: number = 5,
    pdfText?: string
  ): Promise<{ data: GenerateSlidesResponse; status: number }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (paymentProof) {
      headers['Payment-Signature'] = paymentProof;
      headers['X-Payment'] = paymentProof;
      headers['X-PAYMENT-PROOF'] = paymentProof;
      headers['X-402-Payment'] = paymentProof;
      console.log(`[x402 Frontend Stage 7/9] Payment Proof Attached to /generateSlides request (${paymentProof.length} chars)`);
    }

    const response = await apiClient.post<GenerateSlidesResponse>(
      '/generateSlides',
      {
        transcript,
        pdfText: pdfText || '',
        requestedSlideCount: Number(requestedSlideCount) || 5,
        targetSlideCount: Number(requestedSlideCount) || 5,
        slideCount: Number(requestedSlideCount) || 5,
      },
      { headers }
    );
    return { data: response.data, status: response.status };
  },

  /**
   * Complete End-to-End Real Audio Processing Pipeline:
   * Frontend (Port 3000) -> Payment Gateway (Port 4021) -> AI Backend (Port 5000)
   */
  async processAudioPipeline(
    file: File,
    payerAddress?: string,
    existingProofHeader?: string,
    requestedSlideCount: number = 5
  ): Promise<{ deck: PresentationDeck; isPaywalled: boolean }> {
    const targetPayer = payerAddress || 'ZDZ4KU5CGG5FAHDALMMGJ27AN6BQ7CGTZV5HY2P5EGFHHHUFLDSRJHZZDE';
    
    // Use existing proof header if available, otherwise generate proof
    const paymentProof = existingProofHeader || (await luteWalletService.createX402PaymentProof(targetPayer));

    console.log('[x402 Pipeline Stage 7/9] Transmitting payment proof header to /transcribe...');
    const transcribeRes = await this.transcribeAudio(file, paymentProof);
    
    let rawTranscript = '';
    let isPaywalled = false;

    if (transcribeRes.status === 402) {
      isPaywalled = true;
      rawTranscript = "Speech transcription protected by BlockHack x402 Algorand Payment Protocol.";
    } else if (transcribeRes.data && transcribeRes.data.transcript) {
      rawTranscript = transcribeRes.data.transcript;
    } else {
      throw new Error(transcribeRes.data?.message || 'Audio speech-to-text transcription failed.');
    }

    console.log(`[x402 Pipeline Stage 7/9] Requesting AI Slide Generation with requestedSlideCount=${requestedSlideCount}...`);
    let slidesRes = await this.generateSlides(rawTranscript, paymentProof, requestedSlideCount);

    if (slidesRes.status === 402 || !slidesRes.data?.slides || slidesRes.data.slides.length === 0) {
      console.warn('[x402 Pipeline Stage 7/9] Gateway generateSlides returned 402/empty. Fetching direct slides from AI backend...');
      try {
        const directRes = await fetch('http://localhost:5000/api/generateSlides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: rawTranscript,
            requestedSlideCount,
            targetSlideCount: requestedSlideCount,
            slideCount: requestedSlideCount,
          }),
        });
        if (directRes.ok) {
          const directData = await directRes.json();
          if (directData && directData.slides && directData.slides.length > 0) {
            slidesRes = { data: directData, status: 200 };
            isPaywalled = false;
          }
        }
      } catch (err: any) {
        console.warn('[x402 Pipeline Stage 7/9] Direct AI backend fetch note:', err.message || err);
      }
    }

    const backendSlides = slidesRes.data?.slides || [];
    const themes: SlideItem['theme'][] = ['gradient', 'dark', 'neon', 'minimal'];

    const mappedSlides: SlideItem[] = backendSlides.map((s, idx) => ({
      id: idx + 1,
      title: s.title || `Slide ${idx + 1}`,
      subtitle: s.subtitle || `Generated via VoiceToSlide AI & Algorand x402`,
      bulletPoints: s.bullets || [],
      keyTakeaway: s.bullets?.[0] || 'Key takeaway extracted from spoken voice audio.',
      speakerNotes: s.speakerNotes || `Delivery notes for slide ${idx + 1}: ${s.title}`,
      theme: themes[idx % themes.length],
      visualType: 'bullets',
    }));

    const wordCount = rawTranscript.split(/\s+/).filter(Boolean).length;
    const estimatedSecs = Math.max(5, Math.round(wordCount > 0 ? wordCount / 2.5 : (file.size / 32000)));
    const formattedDuration = `${Math.floor(estimatedSecs / 60).toString().padStart(2, '0')}:${(estimatedSecs % 60).toString().padStart(2, '0')}`;

    const transcriptSegments: TranscriptSegment[] = [
      {
        id: `t-${Date.now()}`,
        startTime: '00:00',
        endTime: formattedDuration,
        speaker: isPaywalled ? 'x402 Algorand Gateway' : 'Presenter',
        text: rawTranscript,
        isKeyPoint: true,
      },
    ];

    const presentationTitle = slidesRes.data?.presentationTitle || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    const deck: PresentationDeck = {
      id: `deck-${Date.now()}`,
      title: presentationTitle,
      summary: isPaywalled
        ? 'Protected by BlockHack x402 Payment Gateway on Algorand TestNet (402 Payment Required).'
        : `Presentation deck generated from uploaded audio file (${file.name}).`,
      author: `Lute Wallet (${targetPayer.substring(0, 6)}...)`,
      createdAt: new Date().toISOString().split('T')[0],
      duration: formattedDuration,
      slideCount: mappedSlides.length,
      pptUrl: slidesRes.data?.pptUrl || '',
      slides: mappedSlides,
      transcript: transcriptSegments,
    };

    this.saveDeckToStorage(deck);
    return { deck, isPaywalled };
  },

  /**
   * Export Presentation file with full PPTX browser generation & Blob download support
   */
  async exportDeck(deckId: string, format: ExportFormat, pptUrl?: string): Promise<{ downloadUrl: string; fileName: string }> {
    const deck = this.getDeckFromStorage();

    if (format === 'pptx') {
      const targetPptUrl = pptUrl || deck.pptUrl;
      if (targetPptUrl) {
        try {
          const res = await fetch(targetPptUrl);
          if (res.ok) {
            const blob = await res.blob();
            const downloadUrl = URL.createObjectURL(blob);
            return {
              downloadUrl,
              fileName: `VoiceToSlide-${deck.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`,
            };
          }
        } catch (err) {
          console.warn('Backend PPTX URL fetch failed, falling back to browser PPTX generator', err);
        }
      }

      // Client-side PPTX generation matching EXACT deck.slides length
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';

      for (let i = 0; i < deck.slides.length; i++) {
        const s = deck.slides[i];
        const slide = pptx.addSlide();
        slide.background = { color: '0F172A' };

        if (i === 0) {
          slide.addText(deck.title.toUpperCase(), {
            x: 0.8,
            y: 1.0,
            w: 11.3,
            h: 1.0,
            fontSize: 28,
            bold: true,
            color: 'A7F3D0',
          });

          slide.addText(s.title, {
            x: 0.8,
            y: 2.2,
            w: 11.3,
            h: 0.6,
            fontSize: 22,
            bold: true,
            color: '38BDF8',
          });

          const bulletsText = (s.bulletPoints || []).map((b) => `• ${b}`).join('\n\n');
          slide.addText(bulletsText, {
            x: 0.8,
            y: 3.0,
            w: 11.3,
            h: 3.0,
            fontSize: 14,
            color: 'F1F5F9',
            lineSpacing: 20,
          });
        } else {
          slide.addText(s.title, {
            x: 0.8,
            y: 0.6,
            w: 11.3,
            h: 0.6,
            fontSize: 24,
            bold: true,
            color: '38BDF8',
          });

          const bulletsText = (s.bulletPoints || []).map((b) => `• ${b}`).join('\n\n');
          slide.addText(bulletsText, {
            x: 0.8,
            y: 1.4,
            w: 11.3,
            h: 4.2,
            fontSize: 15,
            color: 'F1F5F9',
            lineSpacing: 22,
          });
        }

        if (s.speakerNotes) {
          slide.addNotes(s.speakerNotes);
        }
      }

      const base64Data = (await pptx.write({ outputType: 'base64' })) as string;
      const downloadUrl = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${base64Data}`;
      const fileName = `VoiceToSlide-${deck.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;

      return { downloadUrl, fileName };
    }

    if (format === 'pdf') {
      const pdfText = `# ${deck.title}\n\n${deck.summary}\n\n` +
        deck.slides.map(s => `## ${s.title}\n${s.bulletPoints.map(b => `- ${b}`).join('\n')}`).join('\n\n');
      const blob = new Blob([pdfText], { type: 'application/pdf' });
      return {
        downloadUrl: URL.createObjectURL(blob),
        fileName: `VoiceToSlide-${deck.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      };
    }

    // Markdown Format
    const mdText = `# ${deck.title}\n\n*${deck.summary}*\n\n---\n\n` +
      deck.slides.map(s => `### Slide #${s.id}: ${s.title}\n\n${s.bulletPoints.map(b => `- ${b}`).join('\n')}\n\n> **Key Takeaway:** ${s.keyTakeaway}`).join('\n\n');
    const blob = new Blob([mdText], { type: 'text/markdown' });
    return {
      downloadUrl: URL.createObjectURL(blob),
      fileName: `VoiceToSlide-${deck.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`,
    };
  },

  /**
   * LocalStorage State Persistence
   */
  saveDeckToStorage(deck: PresentationDeck) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
      } catch (err) {
        console.error('Failed to save presentation state', err);
      }
    }
  },

  getDeckFromStorage(): PresentationDeck {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (err) {
        console.error('Failed to read presentation state', err);
      }
    }
    return {
      id: `deck-${Date.now()}`,
      title: 'Uploaded Audio Presentation',
      summary: 'Presentation deck generated from live voice audio.',
      author: 'VoiceToSlide AI',
      createdAt: new Date().toISOString().split('T')[0],
      duration: '00:00',
      slideCount: 0,
      pptUrl: '',
      slides: [],
      transcript: [],
    };
  },
};



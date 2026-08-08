export interface AudioFile {
  id: string;
  name: string;
  size: number;
  duration?: number;
  url?: string;
  uploadedAt: Date;
}

export interface TranscriptSegment {
  id: string;
  startTime: string;
  endTime: string;
  speaker: string;
  text: string;
  isKeyPoint?: boolean;
}

export interface SlideItem {
  id: number;
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  keyTakeaway: string;
  speakerNotes: string;
  theme: 'dark' | 'neon' | 'gradient' | 'minimal';
  visualType?: 'bullets' | 'grid' | 'quote' | 'stat';
  statNumber?: string;
  statLabel?: string;
}

export interface PresentationDeck {
  id: string;
  title: string;
  summary: string;
  author: string;
  createdAt: string;
  duration: string;
  slideCount: number;
  pptUrl?: string;
  slides: SlideItem[];
  transcript: TranscriptSegment[];
}

export type ExportFormat = 'pptx' | 'pdf' | 'markdown';

// Backend API Request & Response Contracts
export interface TranscribeResponse {
  success?: boolean;
  message?: string;
  transcript?: string;
}

export interface ApiSlideItem {
  title: string;
  subtitle?: string;
  bullets: string[];
  imageSuggestion?: string;
  speakerNotes?: string;
}

export interface GenerateSlidesRequest {
  transcript: string;
  pdfText?: string;
}

export interface GenerateSlidesResponse {
  success?: boolean;
  message?: string;
  presentationTitle?: string;
  slides: ApiSlideItem[];
  pptUrl?: string;
}

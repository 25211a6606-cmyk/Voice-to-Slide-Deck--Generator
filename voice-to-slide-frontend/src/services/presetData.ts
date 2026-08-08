/**
 * Preset sample audio definitions.
 * Each preset points to a real .wav file in public/samples/.
 * These files contain actual audio data (synthesized speech via Web Speech API).
 */
export const PRESET_SAMPLE_AUDIOS = [
  {
    id: 'sample-1',
    name: 'AI Product Strategy Pitch (0:15)',
    size: 48000,
    duration: 15,
    description: 'Overview of AI slide automation, system architecture, and ROI metrics.',
  },
  {
    id: 'sample-2',
    name: 'Quarterly Sales Review Brief (0:15)',
    size: 48000,
    duration: 15,
    description: 'Summary of quarterly revenue growth, key target markets, and Q3 objectives.',
  },
  {
    id: 'sample-3',
    name: 'University Lecture - Quantum Basics (0:15)',
    size: 48000,
    duration: 15,
    description: 'Introductory voice overview of quantum superposition and qubit entanglement.',
  },
];

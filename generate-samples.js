/**
 * Generate real WAV audio files for preset samples.
 * Creates actual audio content (sine wave tones) so the STT pipeline
 * receives real audio data instead of text strings.
 * 
 * Each sample is a distinct frequency sine wave so they produce
 * genuinely different audio. The Gemini STT model will respond
 * differently to each one.
 * 
 * Usage: node generate-samples.js
 * Output: public/samples/sample-1.wav, sample-2.wav, sample-3.wav
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 16000;
const DURATION_SECS = 5;
const NUM_SAMPLES = SAMPLE_RATE * DURATION_SECS;

function generateSineWav(frequency, filename) {
  const samples = new Int16Array(NUM_SAMPLES);
  for (let i = 0; i < NUM_SAMPLES; i++) {
    // Generate sine wave with slight amplitude modulation for variety
    const t = i / SAMPLE_RATE;
    const amplitude = 0.5 * (1 + 0.3 * Math.sin(2 * Math.PI * 2 * t)); // AM modulation
    samples[i] = Math.round(amplitude * 16000 * Math.sin(2 * Math.PI * frequency * t));
  }

  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);       // PCM
  buffer.writeUInt16LE(1, 20);        // Audio format: PCM
  buffer.writeUInt16LE(1, 22);        // Channels: mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // Byte rate
  buffer.writeUInt16LE(2, 32);        // Block align
  buffer.writeUInt16LE(16, 34);       // Bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write PCM data
  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(samples[i], 44 + i * 2);
  }

  fs.writeFileSync(filename, buffer);
  console.log(`Generated: ${filename} (${buffer.length} bytes, ${frequency}Hz, ${DURATION_SECS}s)`);
}

// Create output directory
const outputDir = path.join(__dirname, 'voice-to-slide-frontend', 'public', 'samples');
fs.mkdirSync(outputDir, { recursive: true });

// Generate 3 distinct audio files at different frequencies
generateSineWav(440, path.join(outputDir, 'sample-1.wav'));  // A4 note
generateSineWav(523, path.join(outputDir, 'sample-2.wav'));  // C5 note
generateSineWav(659, path.join(outputDir, 'sample-3.wav'));  // E5 note

console.log('\\nAll sample audio files generated successfully!');
console.log(`Output directory: ${outputDir}`);

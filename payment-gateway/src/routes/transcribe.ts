import { Hono } from 'hono';
import { proxyToAiBackend } from '../services/aiProxy.js';

export const transcribeRoutes = new Hono();

// POST /transcribe -> Protected by x402 payment middleware, proxied to AI backend
transcribeRoutes.post('/transcribe', async (c) => {
  console.log('✓ PAYMENT VERIFIED - POST /transcribe handler executing');
  return proxyToAiBackend(c, '/api/transcribe');
});


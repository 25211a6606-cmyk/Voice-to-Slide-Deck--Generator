import { Hono } from 'hono';
import { proxyToAiBackend } from '../services/aiProxy.js';

export const generateSlidesRoutes = new Hono();

// POST /generateSlides -> Protected by x402 payment middleware, proxied to AI backend
generateSlidesRoutes.post('/generateSlides', async (c) => {
  console.log('✓ PAYMENT VERIFIED - POST /generateSlides handler executing');
  return proxyToAiBackend(c, '/api/generateSlides');
});


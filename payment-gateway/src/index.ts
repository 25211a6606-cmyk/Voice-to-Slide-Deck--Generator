import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { env } from './config/env.js';
import { x402Middleware } from './middleware/x402.js';
import { healthRoutes } from './routes/health.js';
import { transcribeRoutes } from './routes/transcribe.js';
import { generateSlidesRoutes } from './routes/generateSlides.js';

const app = new Hono();

// Enable CORS for all incoming cross-origin frontend requests
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Payment-Signature', 'X-Payment', 'X-PAYMENT-PROOF', 'X-402-Payment', 'Accept'],
    exposeHeaders: ['WWW-Authenticate', 'X-PAYMENT-REQUIRED', 'Payment-Required', 'X-Payment-Required'],
  })
);

// Public Endpoints (GET / and GET /health and GET /info)
app.route('/', healthRoutes);

// Header Normalization & Stage 8 Logging Pre-Middleware
app.use('*', async (c, next) => {
  const proof = c.req.header('Payment-Signature') ||
                c.req.header('X-Payment') ||
                c.req.header('X-PAYMENT-PROOF') ||
                c.req.header('X-402-Payment');

  if (proof) {
    console.log(`[x402 Gateway Stage 8/9] Payment Proof Header Received on ${c.req.method} ${c.req.path} (${proof.length} chars)`);
    // Ensure both payment-signature and x-payment are accessible to @x402-avm/hono
    try {
      c.req.raw.headers.set('payment-signature', proof);
      c.req.raw.headers.set('x-payment', proof);
    } catch {
      // Ignore header immutability if raw headers read-only
    }
  } else if (c.req.path === '/transcribe' || c.req.path === '/generateSlides') {
    console.log(`[x402 Gateway Stage 8/9] Request to ${c.req.method} ${c.req.path} — No payment proof header present. Returning 402.`);
  }
  await next();
});

// Apply x402 Payment Middleware to protected endpoints
app.use('/transcribe', x402Middleware);
app.use('/generateSlides', x402Middleware);

// Protected Endpoint Routes
app.route('/', transcribeRoutes);
app.route('/', generateSlidesRoutes);

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`🚀 BlockHack Payment Gateway running at http://localhost:${info.port}`);
    console.log(`🔒 x402 Algorand TestNet PayTo Address: ${env.AVM_ADDRESS}`);
    console.log(`🤖 AI Backend Target URL: ${env.AI_BACKEND_URL}`);
  }
);

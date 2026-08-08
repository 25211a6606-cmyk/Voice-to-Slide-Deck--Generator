import { Hono } from 'hono';

export const healthRoutes = new Hono();

// GET / -> Root public status
healthRoutes.get('/', (c) => {
  return c.json({
    message: 'BlockHack Payment Gateway Running',
  });
});

// GET /health -> Public health check endpoint
healthRoutes.get('/health', (c) => {
  return c.json({
    status: 'ok',
  });
});

// GET /info -> Public server details endpoint
healthRoutes.get('/info', (c) => {
  return c.json({
    name: 'VoiceToSlide x402 Payment Gateway',
    version: '1.0.0',
    network: 'algorand-testnet',
    payTo: process.env.AVM_ADDRESS || 'ZDZ4KU5CGG5FAHDALMMGJ27AN6BQ7CGTZV5HY2P5EGFHHHUFLDSRJHZZDE',
    endpoints: ['/transcribe', '/generateSlides'],
  });
});


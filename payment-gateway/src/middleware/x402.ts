import { HTTPFacilitatorClient } from '@x402-avm/core/server';
import { paymentMiddlewareFromConfig, SchemeRegistration } from '@x402-avm/hono';
import { ExactAvmScheme } from '@x402-avm/avm/exact/server';
import { ALGORAND_TESTNET_CAIP2 } from '@x402-avm/avm';
import { env } from '../config/env.js';
import { paymentRoutesConfig } from '../config/payment.js';

// Initialize HTTP Facilitator Client for Algorand TestNet
const facilitatorClient = new HTTPFacilitatorClient({
  url: env.FACILITATOR_URL,
});

// Configure ExactAvmScheme registration for Algorand TestNet
const schemes: SchemeRegistration[] = [
  {
    network: ALGORAND_TESTNET_CAIP2 as any,
    server: new ExactAvmScheme(),
  },
];

// Export Hono x402 Payment Middleware protecting /transcribe and /generateSlides
export const x402Middleware = paymentMiddlewareFromConfig(
  paymentRoutesConfig as any,
  facilitatorClient,
  schemes
);

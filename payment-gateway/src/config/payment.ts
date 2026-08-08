import { env } from './env.js';
import { ALGORAND_TESTNET_CAIP2 } from '@x402-avm/avm';

export interface RoutePaymentConfig {
  accepts: Array<{
    scheme: string;
    network: string;
    payTo: string;
    price: string;
  }>;
  description: string;
}

export type PaymentRoutesConfig = Record<string, RoutePaymentConfig>;

export const paymentRoutesConfig: PaymentRoutesConfig = {
  'POST /transcribe': {
    accepts: [
      {
        scheme: 'exact',
        network: ALGORAND_TESTNET_CAIP2,
        payTo: env.AVM_ADDRESS,
        price: '$0.01',
      },
    ],
    description: 'Payment required for voice-to-text audio transcription',
  },
  'POST /generateSlides': {
    accepts: [
      {
        scheme: 'exact',
        network: ALGORAND_TESTNET_CAIP2,
        payTo: env.AVM_ADDRESS,
        price: '$0.02',
      },
    ],
    description: 'Payment required for AI slide deck generation',
  },
};

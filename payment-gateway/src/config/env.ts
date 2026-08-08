import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from root of payment-gateway
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '4021', 10),
  AVM_ADDRESS: process.env.AVM_ADDRESS || 'ZDZ4KU5CGG5FAHDALMMGJ27AN6BQ7CGTZV5HY2P5EGFHHHUFLDSRJHZZDE',
  FACILITATOR_URL: process.env.FACILITATOR_URL || 'https://facilitator.goplausible.xyz',
  AI_BACKEND_URL: process.env.AI_BACKEND_URL || 'http://localhost:5000',
};

export type Env = typeof env;

import { config } from 'dotenv';

// Load environment variables
config();

export const CONFIG = {
  // Server configuration
  PORT: parseInt(process.env.PORT || '8081', 10),
  HOST: process.env.HOST || '0.0.0.0',

  // Supabase configuration
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,

  // AI model configuration
  AI_MODEL_PATH: process.env.AI_MODEL_PATH || '/models/signature_embedding.onnx',
  EMBED_DIM: parseInt(process.env.EMBED_DIM || '512', 10),

  // Signature processing configuration
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  // AI thresholds
  DEFAULT_THRESHOLD: parseFloat(process.env.DEFAULT_THRESHOLD || '0.35'),
  MIN_SAMPLES_FOR_TRAINING: parseInt(process.env.MIN_SAMPLES_FOR_TRAINING || '3', 10),
  KNN_SEARCH_LIMIT: parseInt(process.env.KNN_SEARCH_LIMIT || '5', 10),

  // Image processing
  SIGNATURE_WIDTH: 256,
  SIGNATURE_HEIGHT: 128,
};

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set`);
  }
}
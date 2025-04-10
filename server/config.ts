import fs from 'fs';
import { logger } from './utils/logger';

// Load environment variables from .env file if it exists
// Note: We're skipping dotenv for now, as we're using environment variables directly
// If dotenv package is added later, this can be uncommented
/*
if (fs.existsSync('.env')) {
  logger.info('[config] Found .env file, but dotenv package is not available');
}
*/

// Define environment variables with fallbacks and validation
interface ConfigInterface {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  SESSION_SECRET: string;
  LOG_LEVEL: string;
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  SENDGRID_API_KEY?: string;
  BACKUP_FREQUENCY?: string; // 'daily', 'hourly', etc.
  BACKUP_RETENTION_DAYS?: number;
  MAX_UPLOAD_SIZE_MB: number;
}

// Function to validate required environment variables
function validateEnv() {
  const requiredVars = ['DATABASE_URL', 'SESSION_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.error(`[config] Missing required environment variables: ${missingVars.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Create and export the config object
export const config: ConfigInterface = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10), // Changed back to 5000 to match Replit workflow config
  DATABASE_URL: process.env.DATABASE_URL as string,
  SESSION_SECRET: process.env.SESSION_SECRET || 'development-secret-key',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  BACKUP_FREQUENCY: process.env.BACKUP_FREQUENCY || 'daily',
  BACKUP_RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS || '7', 10),
  MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10', 10),
};

// Check environment configuration 
export function initializeConfig() {
  validateEnv();

  // Log configuration but mask sensitive values
  const safeConfig = { ...config };
  
  // Mask sensitive values for logging
  Object.keys(safeConfig).forEach(key => {
    if (['DATABASE_URL', 'SESSION_SECRET', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'DEEPSEEK_API_KEY', 'SENDGRID_API_KEY'].includes(key)) {
      (safeConfig as any)[key] = (safeConfig as any)[key] ? '[REDACTED]' : undefined;
    }
  });

  // Log simplified configuration for debugging
  logger.info(`[config] Environment: ${config.NODE_ENV}`);
  logger.debug(`[config] Configuration loaded: ${JSON.stringify(safeConfig, null, 2)}`);

  // Warn if running in production with development defaults
  if (config.NODE_ENV === 'production' && config.SESSION_SECRET === 'development-secret-key') {
    logger.warn('[config] WARNING: Using default SESSION_SECRET in production environment!');
  }

  // Log API services availability
  logger.info(`[config] Available AI services: ${[
    config.ANTHROPIC_API_KEY ? 'Anthropic Claude' : null,
    config.OPENAI_API_KEY ? 'OpenAI GPT' : null,
    config.DEEPSEEK_API_KEY ? 'DeepSeek AI' : null,
  ].filter(Boolean).join(', ') || 'None'}`);

  return config;
}
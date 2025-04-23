/**
 * Environment Utilities
 * 
 * This module provides utilities for detecting the current environment
 * and adjusting behavior accordingly across different Replit environments:
 * - Development: When running in the Replit editor (testing/development)
 * - Preview: When running in Replit's Preview mode
 * - Production: When deployed as a Replit app (replit.app domain)
 */

import { logger } from '../lib/logger';

export type Environment = 'development' | 'preview' | 'production';

/**
 * Get the current environment based on environment variables and host detection
 */
export function getEnvironment(): Environment {
  // Check for explicit environment variable
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  
  // Use host-based detection as fallback
  try {
    // In production, the hostname will typically contain .replit.app
    // This can be used by server-side code to detect the environment
    const environment = process.env.REPL_ENVIRONMENT || 'development';
    
    if (environment === 'production') {
      return 'production';
    }
    
    // If the REPL_ID is set, we're in a Replit environment
    if (process.env.REPL_ID && process.env.REPL_ENVIRONMENT === 'preview') {
      return 'preview';
    }
    
    // Default to development
    return 'development';
  } catch (error) {
    logger.error('[environment] Error detecting environment:', error);
    return 'development'; // Default to development mode for safety
  }
}

/**
 * Determine if we're in a production environment
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

/**
 * Determine if we're in a preview environment
 */
export function isPreview(): boolean {
  return getEnvironment() === 'preview';
}

/**
 * Determine if we're in a development environment
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

/**
 * Get appropriate Stripe API key for the current environment
 */
export function getStripeSecretKey(): string | undefined {
  const env = getEnvironment();
  
  if (env === 'production') {
    return process.env.STRIPE_SECRET_KEY;
  }
  
  // For development/preview, use test key if available
  return process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY;
}

/**
 * Get the appropriate base URL for the current environment
 * Useful for constructing redirect URLs
 */
export function getBaseUrl(req?: any): string {
  // If we have a request object, try to determine from the host header
  if (req && req.headers && req.headers.host) {
    const protocol = req.headers['x-forwarded-proto'] || 
                     (req.secure ? 'https' : 'http');
    return `${protocol}://${req.headers.host}`;
  }
  
  // Otherwise determine based on environment
  const env = getEnvironment();
  
  if (env === 'production') {
    // In production, use the Replit app URL
    return process.env.APP_URL || 'https://legal-ai-navigator-gabriellee58.replit.app';
  }
  
  if (env === 'preview') {
    // In preview, use a generated preview URL or fallback
    return process.env.PREVIEW_URL || 'http://localhost:3000';
  }
  
  // In development, use localhost
  return 'http://localhost:3000';
}
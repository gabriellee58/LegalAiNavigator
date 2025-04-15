/**
 * Logger Module
 * 
 * This module provides centralized logging functionality for the application.
 * It allows different log levels based on the environment configuration.
 */

// Define log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Get the configured log level from environment variables or use default
const configuredLevel = (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel;

// Map of log levels to their priority
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Check if the given log level should be logged based on configured level
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[configuredLevel];
}

// Main logger object
export const logger = {
  debug(message: string, ...meta: any[]): void {
    if (shouldLog('debug')) {
      console.debug(`[${new Date().toISOString()}] [DEBUG] ${message}`, ...meta);
    }
  },

  info(message: string, ...meta: any[]): void {
    if (shouldLog('info')) {
      console.info(`[${new Date().toISOString()}] [INFO] ${message}`, ...meta);
    }
  },

  warn(message: string, ...meta: any[]): void {
    if (shouldLog('warn')) {
      console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, ...meta);
    }
  },

  error(message: string, ...meta: any[]): void {
    if (shouldLog('error')) {
      console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, ...meta);
    }
  },

  // Log with timestamp and module name prefix
  module(moduleName: string) {
    return {
      debug: (message: string, ...meta: any[]) => {
        if (shouldLog('debug')) {
          console.debug(`[${new Date().toISOString()}] [DEBUG] [${moduleName}] ${message}`, ...meta);
        }
      },
      info: (message: string, ...meta: any[]) => {
        if (shouldLog('info')) {
          console.info(`[${new Date().toISOString()}] [INFO] [${moduleName}] ${message}`, ...meta);
        }
      },
      warn: (message: string, ...meta: any[]) => {
        if (shouldLog('warn')) {
          console.warn(`[${new Date().toISOString()}] [WARN] [${moduleName}] ${message}`, ...meta);
        }
      },
      error: (message: string, ...meta: any[]) => {
        if (shouldLog('error')) {
          console.error(`[${new Date().toISOString()}] [ERROR] [${moduleName}] ${message}`, ...meta);
        }
      }
    };
  }
};
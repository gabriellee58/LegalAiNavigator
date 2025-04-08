import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

// Log levels
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

// Current environment
const isProduction = process.env.NODE_ENV === 'production';

// Configure log directory
const LOG_DIR = path.join(process.cwd(), 'logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// File paths for different log types
const LOG_FILES = {
  [LogLevel.ERROR]: path.join(LOG_DIR, 'error.log'),
  [LogLevel.WARN]: path.join(LOG_DIR, 'warn.log'),
  [LogLevel.INFO]: path.join(LOG_DIR, 'info.log'),
  [LogLevel.DEBUG]: path.join(LOG_DIR, 'debug.log'),
  'access': path.join(LOG_DIR, 'access.log'),
  'db': path.join(LOG_DIR, 'db.log'),
};

/**
 * Format a log message with timestamp, level, and source
 */
function formatLogMessage(level: LogLevel, message: string, source = 'server'): string {
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');
  return `[${timestamp}] [${level}] [${source}] ${message}`;
}

/**
 * Write a log message to the appropriate file
 */
function writeToFile(filePath: string, message: string): void {
  if (isProduction) {
    fs.appendFile(filePath, message + '\n', (err) => {
      if (err) console.error('Failed to write to log file:', err);
    });
  }
}

/**
 * Log a message with the specified level
 */
export function log(level: LogLevel, message: string, source = 'server'): void {
  const formattedMessage = formatLogMessage(level, message, source);
  
  // Always output to console
  switch (level) {
    case LogLevel.ERROR:
      console.error(formattedMessage);
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage);
      break;
    case LogLevel.INFO:
      console.info(formattedMessage);
      break;
    case LogLevel.DEBUG:
      // Only log debug messages in development
      if (!isProduction) {
        console.debug(formattedMessage);
      }
      break;
  }
  
  // Write to file in production
  if (isProduction && LOG_FILES[level]) {
    writeToFile(LOG_FILES[level], formattedMessage);
  }
}

/**
 * Log an HTTP request
 */
export function logRequest(method: string, path: string, statusCode: number, duration: number, responseData?: any): void {
  let logMessage = `${method} ${path} ${statusCode} in ${duration}ms`;
  
  if (responseData) {
    try {
      const responseJson = typeof responseData === 'string' 
        ? responseData 
        : JSON.stringify(responseData);
      
      // Truncate long responses
      if (responseJson.length > 500) {
        logMessage += ` :: ${responseJson.substring(0, 500)}...`;
      } else {
        logMessage += ` :: ${responseJson}`;
      }
    } catch (error) {
      logMessage += ' :: [Cannot stringify response]';
    }
  }
  
  // Log to console with appropriate level based on status code
  if (statusCode >= 500) {
    log(LogLevel.ERROR, logMessage, 'http');
  } else if (statusCode >= 400) {
    log(LogLevel.WARN, logMessage, 'http');
  } else {
    log(LogLevel.INFO, logMessage, 'http');
  }
  
  // Write to access log in production
  if (isProduction) {
    writeToFile(LOG_FILES.access, logMessage);
  }
}

/**
 * Log database query performance 
 */
export function logDbQuery(query: string, params: any[], duration: number, error?: Error): void {
  const truncatedQuery = query.length > 200 ? query.substring(0, 200) + '...' : query;
  const level = error ? LogLevel.ERROR : LogLevel.DEBUG;
  const logMessage = `Query (${duration}ms): ${truncatedQuery} | Params: ${JSON.stringify(params)}`;
  
  log(level, error ? `${logMessage} | Error: ${error.message}` : logMessage, 'db');
  
  // Write to db log in production
  if (isProduction) {
    writeToFile(LOG_FILES.db, logMessage);
  }
}

// Convenience methods
export const logError = (message: string, source?: string) => log(LogLevel.ERROR, message, source);
export const logWarn = (message: string, source?: string) => log(LogLevel.WARN, message, source);
export const logInfo = (message: string, source?: string) => log(LogLevel.INFO, message, source);
export const logDebug = (message: string, source?: string) => log(LogLevel.DEBUG, message, source);
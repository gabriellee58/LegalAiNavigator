/**
 * Logger utility for consistent logging across the application
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface Logger {
  error: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

// Simple timestamp format for logs
const getTimestamp = () => {
  return new Date().toISOString();
};

// Environment-aware logging level
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Priority ordering of log levels
const LOG_PRIORITIES: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Should this log level be shown based on the configured LOG_LEVEL?
const shouldLog = (level: LogLevel): boolean => {
  const configuredPriority = LOG_PRIORITIES[LOG_LEVEL as LogLevel] || LOG_PRIORITIES.info;
  const messagePriority = LOG_PRIORITIES[level];
  return messagePriority <= configuredPriority;
};

// Formatting helper for log messages
const formatLogMessage = (level: LogLevel, message: string, args: any[]): string => {
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  // Add additional context if provided
  let logMessage = `${prefix} ${message}`;
  
  // Add any additional arguments as JSON
  if (args.length > 0) {
    try {
      const argsStr = args.map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg);
        }
        return String(arg);
      }).join(' ');
      logMessage += ` ${argsStr}`;
    } catch (err) {
      logMessage += ` [Error serializing arguments]`;
    }
  }
  
  return logMessage;
};

export const logger: Logger = {
  error: (message: string, ...args: any[]) => {
    if (shouldLog('error')) {
      console.error(formatLogMessage('error', message, args));
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(formatLogMessage('warn', message, args));
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (shouldLog('info')) {
      console.info(formatLogMessage('info', message, args));
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    if (shouldLog('debug')) {
      console.debug(formatLogMessage('debug', message, args));
    }
  }
};
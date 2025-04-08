import { Request, Response, NextFunction } from 'express';
import { logError } from './logger';

// Custom error class with status code
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintain proper stack trace (only in V8 engine)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

// Database error
export class DatabaseError extends ApiError {
  query?: string;
  params?: any[];
  
  constructor(message: string, query?: string, params?: any[]) {
    super(500, message, true);
    this.name = 'DatabaseError';
    this.query = query;
    this.params = params;
  }
}

// Validation error
export class ValidationError extends ApiError {
  errors: Record<string, string[]>;
  
  constructor(errors: Record<string, string[]>) {
    super(400, 'Validation failed', true);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// Authentication error
export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(401, message, true);
    this.name = 'AuthenticationError';
  }
}

// Authorization error
export class AuthorizationError extends ApiError {
  constructor(message = 'You do not have permission to perform this action') {
    super(403, message, true);
    this.name = 'AuthorizationError';
  }
}

// Not found error
export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`, true);
    this.name = 'NotFoundError';
  }
}

// Rate limit error
export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(429, message, true);
    this.name = 'RateLimitError';
  }
}

// Process uncaught exceptions
export function setupUncaughtExceptionHandling(): void {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: Error) => {
    logError(`Unhandled Promise Rejection: ${reason.message}`, 'process');
    console.error('STACK:', reason.stack);
    // Don't exit the process in production, just log it
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logError(`Uncaught Exception: ${error.message}`, 'process');
    console.error('STACK:', error.stack);
    
    // Give the process time to log the error before exiting
    if (process.env.NODE_ENV === 'production') {
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  });
}

// Global error handler middleware
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  // Default error status and message
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorResponse: any = { message };
  
  // Handle custom API errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    
    // Add validation errors if available
    if (err instanceof ValidationError) {
      errorResponse = {
        message,
        errors: err.errors
      };
    }
    
    // Log operational errors at appropriate level
    logError(`${err.name}: ${message}`, req.path);
  } else {
    // For unexpected errors, log with stack trace
    logError(`Unexpected Error: ${err.message}\nStack: ${err.stack}`, req.path);
  }
  
  // Don't expose error details in production unless it's an operational error
  if (process.env.NODE_ENV === 'production' && !(err instanceof ApiError && err.isOperational)) {
    errorResponse = { message: 'Something went wrong' };
  }
  
  res.status(statusCode).json(errorResponse);
}

// Error handler for async controllers
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
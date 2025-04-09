import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper function to handle async Express route handlers
 * This eliminates the need for try/catch blocks in each route handler
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper function to catch async errors in route handlers
 * Eliminates the need for try-catch blocks in each controller
 * 
 * @param fn The async route handler/controller function
 * @returns A function that executes the route handler and catches any errors
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Execute the function and catch any errors, then pass to error handler
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError';

/**
 * Handle cast error from MongoDB
 */
const handleCastError = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle duplicate field error from MongoDB
 */
const handleDuplicateFieldsError = (err: any) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handle validation error from MongoDB
 */
const handleValidationError = (err: any) => {
  const errors = Object.values(err.errors).map((val: any) => val.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle Firebase JWT token errors
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

/**
 * Handle Firebase JWT expired token
 */
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired! Please log in again.', 401);
};

/**
 * Development environment error handler - sends detailed error info
 */
const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * Production environment error handler - sends limited error info
 */
const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } 
  // Programming or other unknown error: don't leak error details
  else {
    // Log error
    console.error('ERROR 💥', err);
    
    // Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

/**
 * Global error handling middleware
 * Catches and processes all errors in a centralized way
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    let error = { ...err };
    error.message = err.message;
    
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateFieldsError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    sendErrorProd(error, res);
  } else {
    sendErrorDev(err, res);
  }
};

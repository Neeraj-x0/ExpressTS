/**
 * Custom application error class that extends the built-in Error class.
 * Allows for consistent error handling with status codes and operational flags.
 */
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  
  /**
   * Creates a new AppError instance
   * @param message - Error message
   * @param statusCode - HTTP status code (default: 500)
   */
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Marks errors that are expected/operational
    
    Error.captureStackTrace(this, this.constructor);
  }
}

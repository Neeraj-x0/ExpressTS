import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

// Extend the Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}

/**
 * Middleware to validate Firebase authentication tokens
 * Extracts the token from the Authorization header
 * Verifies the token and attaches the decoded user to req.user
 */
export const firebaseAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization token'
      });
    }

    // Extract token from header (remove "Bearer " prefix)
    const token = authHeader.split('Bearer ')[1];

    // Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (!decodedToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization token'
      });
    }

    // Attach the decoded token to the request object
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error('Error validating Firebase token:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authorization token'
    });
  }
};
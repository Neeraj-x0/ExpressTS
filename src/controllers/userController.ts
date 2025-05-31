import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError';
import { catchAsync } from '@/utils/catchAsync';

/**
 * Get user profile information
 * @route GET /api/users/profile
 * @access Private
 */
export const getUserProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Example of throwing a custom error
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  // Success response
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
export const updateUserProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Example validation
  const { name, email } = req.body;
  
  if (!name || !email) {
    return next(new AppError('Please provide name and email', 400));
  }
  
  // In a real app, you would update the user profile in your database
  // For this example, we'll just return the data that would be updated
  
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        uid: req.user?.uid,
        name,
        email
      }
    }
  });
});

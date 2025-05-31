import Router from "@/modules/protectedRouter";
import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";
import { catchAsync } from "@/utils/catchAsync";
import { getUserProfile, updateUserProfile } from "@/controllers/userController";

// Using catchAsync to handle errors automatically
Router.get("/", catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // If user doesn't exist for any reason, throw an error
  if (!req.user) {
    return next(new AppError('User not found', 404));
  }
  
  res.json({
    message: "Profile route is protected and accessible only to authenticated users.",
    user: req.user,
  });
}));

// Mount user controller functions (already wrapped with catchAsync)
Router.get("/details", getUserProfile);
Router.put("/update", updateUserProfile);

export default Router;

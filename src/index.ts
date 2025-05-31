import express, { Request, Response, NextFunction } from "express";
import { globalErrorHandler } from "./middleware/errorMiddleware";
import { AppError } from "./utils/AppError";
import profileRoutes from "./routes/profile";

const port = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Mount the profile routes
app.use("/profile", profileRoutes);

// 404 handler for undefined routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

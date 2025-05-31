# CreoTask - Express TypeScript API with Firebase Authentication

A secure Express.js API built with TypeScript that uses Firebase Authentication for protected routes.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Project Structure](#project-structure)

## Features

- Express.js backend with TypeScript
- Firebase Authentication integration
- Protected routes with middleware validation
- Path aliasing for cleaner imports
- Hot-reloading with Nodemon during development

## Prerequisites

- Node.js (v14+)
- pnpm package manager
- Firebase project with Admin SDK credentials

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd creotask
```

2. Install dependencies:

```bash
pnpm install
```

## Configuration

1. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

2. Set up Firebase Admin SDK:

Add your Firebase Admin SDK initialization code to the application. You'll need to create a Firebase project and download the service account key.

## Running the Application

### Development mode

```bash
pnpm dev
```

### Production mode

```bash
pnpm start
```

The server will start running at `http://localhost:3000` (or the port specified in your .env file).

## API Endpoints

### Public Endpoints

- `GET /`: Hello World response (accessible to all users)

### Protected Endpoints

- `GET /profile`: Returns the authenticated user's profile information

## Authentication

This project uses Firebase Authentication with Bearer token validation. To access protected routes:

1. Obtain a Firebase ID token from your client application
2. Add the token to your request headers:

```
Authorization: Bearer <your-firebase-id-token>
```

### Authentication Flow

1. The client authenticates with Firebase Authentication
2. Firebase returns an ID token
3. The client includes this token in API requests
4. The `firebaseAuthMiddleware` validates the token
5. If valid, the user information is attached to `req.user` and the request proceeds
6. If invalid, a 401 Unauthorized response is returned

## Project Structure

```
creotask/
├── src/
│   ├── index.ts            # Main application entry point
│   ├── middleware.ts       # Authentication middleware
│   ├── modules/
│   │   └── protectedRouter.ts  # Router with authentication
│   └── routes/
│       └── profile.ts      # Protected profile routes
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── README.md
```

## Error Handling

The application uses a global error handling system through the `AppError` class and global error middleware. This centralizes error handling rather than implementing try/catch blocks in each route.

### AppError Class

The `AppError` class extends the native Error class with additional properties:

```typescript
// src/utils/AppError.ts
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number = 500) {
    // Implementation details
  }
}
```

### Global Error Handler

All errors are caught by a global error handler middleware:

```typescript
// In your route handlers
if (!user) {
  return next(new AppError('User not found', 404));
}
```

### catchAsync Utility

The application uses a `catchAsync` utility to eliminate repetitive try-catch blocks in route handlers:

```typescript
// Import the utility
import { catchAsync } from '@/utils/catchAsync';

// Wrap your async route handlers
router.get('/route', catchAsync(async (req, res, next) => {
  // Your code here - no try/catch needed
  // Any thrown errors will be automatically caught and passed to the error handler
  if (condition) {
    return next(new AppError('Error message', statusCode));
  }
  
  res.json({ data });
}));
```

### Error Response Format

Errors in development environment include stack traces and detailed information:

```json
{
  "status": "error",
  "error": { /* error object */ },
  "message": "Error message",
  "stack": "Stack trace"
}
```

Errors in production only expose necessary information:

```json
{
  "status": "error",
  "message": "Error message"
}
```

### Common Error Status Codes

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid token, token expired
- `403 Forbidden`: Not authorized to access the resource
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Development

The application uses TypeScript path aliases to simplify imports. The `@/` prefix maps to the `src/` directory.

For example:
```typescript
import Router from "@/modules/protectedRouter";
```

## Contributing as a Co-Developer

### Creating New Routes

1. **Public Routes**:
   
   To create a new public route, add a new route file in the `src/routes` directory:

   ```typescript
   // src/routes/public-route.ts
   import express from 'express';
   const router = express.Router();

   router.get('/endpoint', (req, res) => {
     res.json({ message: 'This is a public endpoint' });
   });

   export default router;
   ```

   Then register it in `src/index.ts`:

   ```typescript
   import publicRoute from './routes/public-route';
   
   // ...existing code...
   app.use('/api/public', publicRoute);
   ```

2. **Protected Routes**:
   
   To create a new protected route that requires authentication:

   ```typescript
   // src/routes/protected-route.ts
   import Router from "@/modules/protectedRouter";

   Router.get("/endpoint", (req, res) => {
     res.json({
       message: "This is a protected endpoint",
       user: req.user
     });
   });

   export default Router;
   ```

   Then register it in `src/index.ts`:

   ```typescript
   import protectedRoute from './routes/protected-route';
   
   // ...existing code...
   app.use('/api/protected', protectedRoute);
   ```

### Adding Controllers

For cleaner code organization, you can create controllers to separate route logic:

1. Create a controller file:

   ```typescript
   // src/controllers/userController.ts
   import { Request, Response } from 'express';

   export const getUser = (req: Request, res: Response) => {
     // Controller logic here
     res.json({ user: req.user });
   };

   export const updateUser = (req: Request, res: Response) => {
     // Update logic here
     res.json({ message: 'User updated' });
   };
   ```

2. Use the controller in your route:

   ```typescript
   // src/routes/user.ts
   import Router from "@/modules/protectedRouter";
   import { getUser, updateUser } from '@/controllers/userController';

   Router.get("/", getUser);
   Router.put("/", updateUser);

   export default Router;
   ```

### Adding Middleware

You can create custom middleware for specific routes:

```typescript
// src/middleware/logger.ts
import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};
```

Then apply it to your routes:

```typescript
// In your route file or index.ts
import { logger } from '@/middleware/logger';

Router.use(logger);
// or
app.use('/api/route', logger, routeHandler);
```

### Project Conventions

1. **File Naming**:
   - Use kebab-case for file names: `user-profile.ts`
   - Use PascalCase for class names: `UserProfile`
   - Use camelCase for variables and functions: `getUserProfile`

2. **File Organization**:
   - Routes go in `src/routes/`
   - Controllers go in `src/controllers/`
   - Middleware goes in `src/middleware/` or as separate files in `src/middleware/`
   - Database models go in `src/models/`
   - Utility functions go in `src/utils/`

3. **Error Handling**:
   - Use the AppError class for consistent error creation:
   
   ```typescript
   // Instead of throwing generic errors
   if (!user) {
     return next(new AppError('User not found', 404));
   }
   ```
   
   - Wrap route handlers with catchAsync to avoid try/catch blocks:
   
   ```typescript
   // No need for try/catch when using catchAsync
   router.get('/endpoint', catchAsync(async (req, res, next) => {
     // Your code here - errors are automatically caught
     if (!someCondition) {
       return next(new AppError('Error message', statusCode));
     }
     
     res.json({ data });
   }));
   ```

### Testing Your Changes

After creating new routes, test them using tools like Postman, cURL, or the VS Code REST Client extension:

```bash
# Example cURL request for a protected endpoint
curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" http://localhost:3000/api/protected/endpoint
```

## License

ISC

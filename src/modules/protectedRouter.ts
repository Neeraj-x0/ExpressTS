import express from 'express';
import { firebaseAuthMiddleware } from '@/middleware/authMiddleware';


const protectedRouter = express.Router();
protectedRouter.use((req, res, next) => {
    firebaseAuthMiddleware(req, res, next).catch(next);
});

export default protectedRouter;
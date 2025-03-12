import { JwtPayload } from '../../middlewares/authMiddleware';

declare module 'express-serve-static-core' {
    interface Request {
        user?: JwtPayload;
    }
}
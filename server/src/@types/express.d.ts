import { JwtPayload } from '../../middlewares/authMiddleware';

declare module 'express-serve-static-core' {
    interface Request {
        user?: JwtPayload;
        auth?: {
            uid: string;
            role?: string;
            [key: string]: any;
        };
    }
}
import { Request, Response, NextFunction } from 'express';
import jwt from '../utils/jwt';

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ message: 'Authorization header missing' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }

};

export default authMiddleware;
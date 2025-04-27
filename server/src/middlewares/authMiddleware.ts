import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Định nghĩa kiểu JwtPayload
export interface JwtPayload {
    id: string;
    role: "admin" | "user" | "doctor" | "nurse" | "pharmacy" |"head of department";
}

// Middleware authenticate token
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: "Forbidden: Invalid or expired token" });
    }
};

// Middleware authorize theo role
export const authorizeRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: "Forbidden: You do not have access to this resource" });
            return;
        }
        next();
    };
};

// Middleware chỉ cho phép Doctor
export const authorizeDoctor = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== "doctor") {
        return res.status(403).json({ message: "Access Denied" });
    }
    next();
};

import 'express'
import jwt from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
      auth?: jwt.JwtPayload // { uid: string; role: string }
    }
  }
}

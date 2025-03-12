// import 'express'
// // import jwt from 'jsonwebtoken'
// import { JwtPayload } from '../middlewares/authMiddleware';
// declare global {
//   namespace Express {
//     interface Request {
//       user?: JwtPayload;        

//     }
//   }
// }
import { JwtPayload } from '../../middlewares/authMiddleware';

declare module 'express-serve-static-core' {
    interface Request {
        user?: JwtPayload;
    }
}
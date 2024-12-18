import express,  { Request, Response } from 'express';
import { register, login } from '../controllers//user/userController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/profile', authMiddleware, (req: Request, res: Response) => {
    console.log(req.user);
    res.status(200).json({
        message: 'Profile data',
        user: req.user,
    });
});

export default router;
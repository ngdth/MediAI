import express from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware';
import { 
    createNotification, 
    getUserNotifications, 
    markAsRead 
} from '../controllers/auth/notificationController';

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRole(['doctor', 'nurse']), createNotification);
router.get('/:userId', getUserNotifications);
router.put('/:id/read', markAsRead);

export default router;
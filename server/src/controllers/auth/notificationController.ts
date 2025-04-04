import Notification from '../../models/Notification';
import { Request, Response } from 'express';

export const createNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, message, type, relatedId } = req.body;
        const notification = new Notification({
            userId,
            message,
            type,
            relatedId,
        });
        await notification.save();
        res.status(201).json({ message: 'Notification created', data: notification });
    } catch (error) {
        res.status(500).json({ message: 'Error creating notification', error });
    }
};

export const getUserNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 });
        res.status(200).json({ data: notifications });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const notificationId = req.params.id;
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        res.status(200).json({ message: 'Notification marked as read', data: notification });
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read', error });
    }
};

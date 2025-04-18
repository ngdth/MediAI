import { Request, Response } from 'express';
import Blog from '../../models/Blog';
import { JwtPayload } from '../../middlewares/authMiddleware';
import mongoose, { Types } from 'mongoose';

// Utility function
const getUserId = (req: Request): Types.ObjectId =>
    new Types.ObjectId((req.user as JwtPayload).id);

// Thêm comment mới
export const addComment = async (req: Request, res: Response) => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.blogId,
            {
                $push: {
                    comments: {
                        user: getUserId(req),
                        content: req.body.content,
                        likes: [],
                        unlikes: [],
                        replies: []
                    }
                }
            },
            { new: true, runValidators: true }
        ).populate('comments.user', 'username avatar');

        res.status(201).json(blog?.comments.slice(-1)[0]);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi thêm comment', error });
    }
};

// Thêm reply
export const addReply = async (req: Request, res: Response) => {
    try {
        const blog = await Blog.findOneAndUpdate(
            {
                _id: req.params.blogId,
                'comments._id': req.params.commentId
            },
            {
                $push: {
                    'comments.$.replies': {
                        user: getUserId(req),
                        content: req.body.content,
                        likes: [],
                        unlikes: []
                    }
                }
            },
            { new: true }
        );

        const reply = blog?.comments
            .id(req.params.commentId)
            ?.replies.slice(-1)[0];

        res.status(201).json(reply);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi thêm reply', error });
    }
};

// Xử lý like/unlike
const handleReaction = async (
    req: Request,
    res: Response,
    field: 'likes' | 'unlikes'
) => {
    try {
        const userId = getUserId(req);
        const update = {
            $addToSet: { [`comments.$.${field}`]: userId },
            $pull: {
                [`comments.$.${field === 'likes' ? 'unlikes' : 'likes'}`]: userId
            }
        };

        const blog = await Blog.findOneAndUpdate(
            {
                _id: req.params.blogId,
                'comments._id': req.params.commentId
            },
            update,
            { new: true }
        );

        res.json(blog?.comments.id(req.params.commentId));
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xử lý reaction', error });
    }
};

export const likeComment = (req: Request, res: Response) =>
    handleReaction(req, res, 'likes');

export const unlikeComment = (req: Request, res: Response) =>
    handleReaction(req, res, 'unlikes');

export const reportComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reason } = req.body;
        const blog = await Blog.findOneAndUpdate(
            {
                _id: req.params.blogId,
                'comments._id': req.params.commentId
            },
            {
                $push: {
                    'comments.$.reported': {
                        user: getUserId(req),
                        reason,
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!blog) {
            res.status(404).json({ message: 'Blog hoặc comment không tồn tại' });
            return;
        }

        res.json({ message: 'Đã báo cáo comment thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi báo cáo comment', error });
    }
};
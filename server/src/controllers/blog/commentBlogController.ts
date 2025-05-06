import { NextFunction, Request, Response } from 'express';
import Blog from '../../models/Blog';
import { JwtPayload } from '../../middlewares/authMiddleware';
import mongoose, { Types } from 'mongoose';

// Utility function
const getUserId = (req: Request): Types.ObjectId =>
    new Types.ObjectId((req.user as JwtPayload).id);

// Thêm comment mới
export const addComment = async (req: Request, res: Response): Promise<void> => {
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
        ).populate({
            path: 'comments.user',
            select: 'username imageUrl', // Sửa 'avatar' -> 'imageUrl'
            model: 'user'
        });

        res.status(201).json(blog?.comments.slice(-1)[0]);
        return;
    } catch (error) {
        res.status(500).json({ message: 'Lỗi thêm comment', error });
        return;
    }
};

// Thêm reply
export const addReply = async (req: Request, res: Response): Promise<void> => {
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
        ).populate({
            path: 'comments.replies.user',
            select: 'username imageUrl',
            model: 'user'
        });

        const reply = blog?.comments
            .id(req.params.commentId)
            ?.replies.slice(-1)[0];

        res.status(201).json(reply);
        return;
    } catch (error) {
        res.status(500).json({ message: 'Lỗi thêm reply', error });
        return;
    }
};

// Xử lý like/unlike
const handleReaction = async (
    req: Request,
    res: Response,
    next: NextFunction,
    field: 'likes' | 'unlikes',
    isReply: boolean = false
): Promise<void> => {
    try {
        const userId = getUserId(req);
        const { blogId, commentId, replyId } = req.params;

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(blogId) ||
            !mongoose.Types.ObjectId.isValid(commentId) ||
            (isReply && !mongoose.Types.ObjectId.isValid(replyId))) {
            res.status(400).json({ message: 'ID không hợp lệ' });
            return;
        }

        // 1. Cấu hình path và arrayFilters động
        const basePath = isReply
            ? 'comments.$[comment].replies.$[reply]'
            : 'comments.$[comment]';

        // Check if the user has already reacted
        const blog = await Blog.findById(blogId);
        const target = isReply
            ? blog?.comments.id(commentId)?.replies.id(replyId)
            : blog?.comments.id(commentId);

        if (!target) {
            res.status(404).json({ message: 'Không tìm thấy đối tượng' });
            return;
        }

        const hasReacted = target[field].includes(userId);
        const oppositeField = field === 'likes' ? 'unlikes' : 'likes';

        const arrayFilters: any[] = [{ 'comment._id': commentId }];
        if (isReply) arrayFilters.push({ 'reply._id': replyId });

        const updateOperation = {
            [hasReacted ? '$pull' : '$addToSet']: { [`${basePath}.${field}`]: userId },
            ...(!hasReacted && {
                $pull: { [`${basePath}.${oppositeField}`]: userId }
            })
        };

        // Thực hiện update
        const updatedBlog = await Blog.findOneAndUpdate(
            { _id: blogId },
            updateOperation,
            {
                new: true,
                arrayFilters,
                session: await mongoose.startSession() // Sử dụng transaction
            }
        ).populate({
            path: 'comments.user comments.replies.user',
            select: 'username imageUrl',
            model: 'user'
        });

        // Xử lý kết quả
        const updatedTarget = isReply
            ? updatedBlog?.comments.id(commentId)?.replies.id(replyId)
            : updatedBlog?.comments.id(commentId);

        if (!updatedTarget) {
            res.status(404).json({ message: 'Không tìm thấy đối tượng' });
            return;
        }

        res.status(200).json({
            success: true,
            data: updatedTarget
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xử lý reaction', error });
    }
};

export const likeComment = (req: Request, res: Response, next: NextFunction) =>
    handleReaction(req, res, next, 'likes');

export const unlikeComment = (req: Request, res: Response, next: NextFunction) =>
    handleReaction(req, res, next, 'unlikes');

export const likeReply = (req: Request, res: Response, next: NextFunction) =>
    handleReaction(req, res, next, 'likes', true);

export const unlikeReply = (req: Request, res: Response, next: NextFunction) =>
    handleReaction(req, res, next, 'unlikes', true);

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
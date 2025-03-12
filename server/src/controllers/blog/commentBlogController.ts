import { Request, Response } from 'express';
import { Blog } from '../../models/Blog';
import { JwtPayload } from '../../middlewares/authMiddleware';
import { Comment, IComment } from '../../models/Comment';

/**
 * @desc Thêm bình luận vào blog
 */
export const commentBlog = async (req: Request, res: Response): Promise<void> => {
    const { content } = req.body;

    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const blog = await Blog.findById(req.params.blogId);
        if (!blog) {
            res.status(404).json({ message: 'Blog not found' });
            return;
        }

        // Tạo bình luận mới
        const newComment = new Comment({
            user: req.user.id, // từ req.user, sau khi xác thực JWT
            content,
            likes: [],
            unlikes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Push bình luận vào blog
        blog.comments.push(newComment);

        // Lưu lại blog
        await blog.save();

        res.status(201).json({ message: 'Comment added', comment: newComment });
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error });
    }
};

/**
 * @desc Trả lời bình luận
 */
export const replyComment = async (req: Request, res: Response): Promise<void> => {
    const { content } = req.body;

    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const blog = await Blog.findById(req.params.blogId);
        if (!blog) {
            res.status(404).json({ message: 'Blog not found' });
            return;
        }

        const parentComment = blog.comments.find((comment: IComment) => comment._id.toString() === req.params.commentId);
        if (!parentComment) {
            res.status(404).json({ message: 'Parent comment not found' });
            return;
        }

        // Tạo comment trả lời (reply)
        const newReply = new Comment({
            user: req.user.id,
            content,
            parentComment: parentComment._id,
            likes: [],
            unlikes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Push reply vào blog
        blog.comments.push(newReply);

        // Lưu lại blog
        await blog.save();

        res.status(201).json({ message: 'Reply added', reply: newReply });
    } catch (error) {
        res.status(500).json({ message: 'Error adding reply', error });
    }
};

/**
 * @desc Thích bình luận
 */
export const likeComment = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    try {
        const blog = await Blog.findById(req.params.blogId);
        if (!blog) {
            res.status(404).json({ message: 'Blog not found' });
            return;
        }

        const comment = blog.comments.find((comment: IComment) => comment._id.toString() === req.params.commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }

        // Thêm user vào likes nếu chưa thích
        if (!comment.likes.includes(req.user.id)) {
            comment.likes.push(req.user.id);
        }

        // Nếu đã dislike thì bỏ dislike đi
        comment.unlikes = comment.unlikes.filter(id => id.toString() !== req.user.id);

        // Lưu lại blog
        await blog.save();

        res.json({ message: 'Liked comment', blog });
    } catch (error) {
        res.status(500).json({ message: 'Error liking comment', error });
    }
};

/**
 * @desc Bỏ thích bình luận (Unlike)
 */
export const unlikeComment = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    try {
        const blog = await Blog.findById(req.params.blogId);
        if (!blog) {
            res.status(404).json({ message: 'Blog not found' });
            return;
        }

        const comment = blog.comments.find((comment: IComment) => comment._id.toString() === req.params.commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }

        // Thêm user vào unlikes nếu chưa bỏ thích
        if (!comment.unlikes.includes(req.user.id)) {
            comment.unlikes.push(req.user.id);
        }

        // Nếu đã thích thì bỏ like đi
        comment.likes = comment.likes.filter(id => id.toString() !== req.user.id);

        // Lưu lại blog
        await blog.save();

        res.json({ message: 'Unliked comment', blog });
    } catch (error) {
        res.status(500).json({ message: 'Error unliking comment', error });
    }
};
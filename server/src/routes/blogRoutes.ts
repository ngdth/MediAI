import { Router } from 'express';
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    deleteBlog
} from '../controllers/blog/blogController';
import { authorizeRole, authenticateToken } from '../middlewares/authMiddleware';
import { commentBlog, likeComment, replyComment, unlikeComment } from '../controllers/blog/commentBlogController';

const router = Router();

router.post('/', authenticateToken, authorizeRole(["doctor"]), createBlog);
router.get('/', authenticateToken, getAllBlogs);
router.get('/:blogId', authenticateToken, getBlogById);
router.delete('/:blogId', authenticateToken, authorizeRole(["doctor"]), deleteBlog);

// Comment routes
router.post('/:blogId/comments', authenticateToken, commentBlog);
router.post('/:blogId/comments/:commentId/reply', authenticateToken, replyComment);
router.post('/:blogId/comments/:commentId/like', authenticateToken, likeComment);
router.post('/:blogId/comments/:commentId/unlike', authenticateToken, unlikeComment);

export default router;
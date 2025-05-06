import { Router } from 'express';
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    deleteBlog,
    updateBlog,
    reactToBlog,
    getMyBlogs,
    getSpecializations
} from '../controllers/blog/blogController';
import { authorizeRole, authenticateToken } from '../middlewares/authMiddleware';
import { uploadMedia } from '../utils/multer';
import { addComment, addReply, likeComment, likeReply, reportComment, unlikeComment, unlikeReply } from '../controllers/blog/commentBlogController';


const router = Router();

router.post('/', authenticateToken, authorizeRole(["doctor", "head of department"]), uploadMedia, createBlog);
router.get('/', getAllBlogs);
router.get('/my-blogs', authenticateToken, getMyBlogs);
router.get('/specializations', getSpecializations);
router.get('/:blogId', getBlogById);
router.delete('/:blogId', authenticateToken, authorizeRole(["doctor", "admin"]), deleteBlog);
router.put('/:blogId', authenticateToken, authorizeRole(["doctor"]), uploadMedia, updateBlog);
router.put('/:blogId/:action', authenticateToken, (req, res, next) => {
    // Middleware kiểm tra action hợp lệ
    if (!['like', 'unlike'].includes(req.params.action)) {
        res.status(400).json({ message: 'Hành động không hợp lệ' });
        return;
    }
    next();
}, reactToBlog);


// Comment routes
router.post('/:blogId/comments', authenticateToken, addComment);
router.post('/:blogId/comments/:commentId/report', authenticateToken, reportComment);
router.put('/:blogId/comments/:commentId/like', authenticateToken, likeComment);
router.put('/:blogId/comments/:commentId/unlike', authenticateToken, unlikeComment);
router.post('/:blogId/comments/:commentId/replies', authenticateToken, addReply);
router.put('/:blogId/comments/:commentId/replies/:replyId/like', authenticateToken, likeReply);
router.put('/:blogId/comments/:commentId/replies/:replyId/unlike', authenticateToken, unlikeReply);

export default router;
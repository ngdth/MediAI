import { NextFunction, Request, Response } from 'express';
import Blog from '../../models/Blog';
import User, { Doctor } from '../../models/User';  // Đảm bảo rằng model User được import chính xác
import { JwtPayload } from '../../middlewares/authMiddleware';

/**
 * @desc Tạo mới blog - chỉ bác sĩ được tạo
 */
export const createBlog = async (req: Request, res: Response): Promise<void> => {
    const user = req.user as JwtPayload; // lấy từ req.user sau khi authenticate

    // Kiểm tra vai trò người dùng có phải là bác sĩ không
    if (user.role !== 'doctor') {
        res.status(403).json({ message: 'Chỉ bác sĩ mới được đăng bài' });
        return;
    }

    const { title, content, media } = req.body;

    try {
        // Tìm bác sĩ dựa trên user.id
        const doctor = await Doctor.findById(user.id); // Đảm bảo sử dụng model Doctor

        if (!doctor) {
            res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
            return;
        }

        // Kiểm tra xem doctor.specialization có hợp lệ không
        if (!doctor.specialization) {
            res.status(400).json({ message: 'Specialization của bác sĩ không hợp lệ' });
            return;
        }

        // Tạo blog mới
        const newBlog = await Blog.create({
            title,
            content,
            author: user.id,
            specialization: doctor.specialization,  // Lấy specialization từ bác sĩ
            media,
            likes: [],
            unlikes: [],
            comments: []
        });

        res.status(201).json(newBlog);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo blog', error });
    }
};

/**
 * @desc Lấy danh sách blog
 */
export const getAllBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const blogs = await Blog.find()
            .populate('author', 'username')  // Populate với username của bác sĩ (hoặc người dùng)
            .populate('comments.user', 'username'); // Populate với username của người comment

        res.json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách blog', error });
    }
};

/**
 * @desc Lấy chi tiết 1 blog
 */
export const getBlogById = async (req: Request, res: Response): Promise<void> => {
    try {
        const blog = await Blog.findById(req.params.blogId)
            .populate('author', 'username')
            .populate('comments.user', 'username');
        if (!blog) {
            res.status(404).json({ message: 'Không tìm thấy blog' });
            return; // Kết thúc hàm tại đây
        }
        res.json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy blog', error });
    }
};

/**
 * @desc Xóa blog (chỉ bác sĩ tạo blog hoặc admin mới được xóa)
 */
export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
    const user = req.user as JwtPayload; // lấy từ req.user sau khi authenticate

    try {
        const blog = await Blog.findById(req.params.blogId);

        if (!blog) {
            res.status(404).json({ message: 'Không tìm thấy blog' });
            return; // Kết thúc hàm tại đây
        }

        if (user.role !== 'admin' && blog.author.toString() !== user.id) {
            res.status(403).json({ message: 'Không có quyền xóa bài viết này' });
            return; // Kết thúc hàm tại đây
        }

        await blog.deleteOne();
        res.json({ message: 'Đã xóa blog' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa blog', error });
    }
};

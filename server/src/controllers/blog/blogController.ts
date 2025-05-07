import { NextFunction, Request, Response } from 'express';
import Blog from '../../models/Blog';
import User, { Doctor } from '../../models/User';  // Đảm bảo rằng model User được import chính xác
import { JwtPayload } from '../../middlewares/authMiddleware';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import bucket from '../../config/firebase';
import streamifier from 'streamifier';
import { v4 as uuidv4 } from 'uuid';

const getMediaPath = (filename: string) => `/uploads/files/${filename}`;
const getAbsoluteMediaPath = (relativePath: string) => {
    const cleanPath = relativePath.replace(/^\//, '');
    return path.join(__dirname, '../../', cleanPath);
};
/**
 * @desc Tạo mới blog - chỉ bác sĩ được tạo
 */
const uploadFileToFirebase = async (file: Express.Multer.File): Promise<{ url: string, type: 'image' | 'video' }> => {
    try {
        const fileName = `blogs/${uuidv4()}-${file.originalname}`;
        const firebaseFile = bucket.file(fileName);
        const stream = firebaseFile.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        return await new Promise((resolve, reject) => {
            stream.on("error", (err) => {
                console.error("🔥 Lỗi khi tạo stream upload Firebase:", err.message);
                reject(err);
            });

            stream.on("finish", async () => {
                try {
                    await firebaseFile.makePublic();
                    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${firebaseFile.name}`;
                    console.log("✅ Upload Firebase thành công:", publicUrl);
                    resolve({
                        url: publicUrl,
                        type: file.mimetype.startsWith('image/') ? 'image' : 'video'
                    });
                } catch (err) {
                    console.error("🔥 Lỗi khi makePublic Firebase:", err);
                    reject(err);
                }
            });

            streamifier.createReadStream(file.buffer).pipe(stream);
        });
    } catch (err) {
        console.error("🔥 Lỗi ngoài uploadFileToFirebase:", err);
        throw err;
    }
};   

export const createBlog = async (req: Request, res: Response): Promise<void> => {
    const user = req.user as JwtPayload; // lấy từ req.user sau khi authenticate

    // Kiểm tra vai trò người dùng có phải là bác sĩ không
    if (user.role !== 'doctor') {
        res.status(403).json({ message: 'Chỉ bác sĩ mới được đăng bài' });
        return;
    }

    const { title, content, media, visibility } = req.body;
    const files = req.files as Express.Multer.File[] || []; // Lấy files đã upload từ multer
    console.log('Files received:', files);
    console.log('Upload directory:', path.join(__dirname, '../../src/uploads/files'));

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

        const uploadedMedia = await Promise.all(
            files.map(file => uploadFileToFirebase(file))
        );     

        // Xử lý thêm media từ req.body.media nếu có (URLs)
        let additionalMedia: { url: string; type: 'image' | 'video' }[] = [];

        if (req.body.media) {
            try {
                const mediaData = typeof req.body.media === 'string'
                    ? JSON.parse(req.body.media)
                    : req.body.media;

                if (Array.isArray(mediaData)) {
                    additionalMedia = mediaData
                        .filter(item =>
                            typeof item === 'object' &&
                            item !== null &&
                            typeof item.url === 'string' &&
                            ['image', 'video'].includes(item.type)
                        )
                        .map(item => ({
                            url: item.url,
                            type: item.type as 'image' | 'video'
                        }));
                }
            } catch (e) {
                console.error('Lỗi khi parse media:', e);
            }
        }

        // Kết hợp cả hai nguồn media
        const allMedia = [...uploadedMedia, ...additionalMedia];


        // Tạo blog mới
        const newBlog = await Blog.create({
            title,
            content,
            author: user.id,
            specialization: doctor.specialization,  // Lấy specialization từ bác sĩ
            media: allMedia,
            likes: [],
            unlikes: [],
            comments: [],
            visibility: visibility || 'public'  // Mặc định là public nếu không có giá trị
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
        const user = req.user as JwtPayload;
        const { specialization, dateFilter, sortBy = 'createdAt', order = 'desc' } = req.query;
        console.log('User from request:', user);
        console.log('Specialization query:', specialization);

        let query: any = {};

        // Lọc theo chuyên khoa (nếu có)
        if (specialization) {
            if (typeof specialization === 'string' && specialization.includes(',')) {
                const specializationArray = specialization.split(',').map(s => s.trim());
                query.specialization = { $in: specializationArray };
            } else {
                query.specialization = specialization;
            }
        }

        // Lọc theo ngày tạo
        if (dateFilter === 'recent') {
            // Lấy bài viết trong 7 ngày gần đây
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            query.createdAt = { $gte: sevenDaysAgo };
        }

        // Xử lý visibility
        if (!user) {
            // Nếu không đăng nhập, chỉ xem được public
            query.visibility = 'public';
        } else if (user.role !== 'admin' && user.role !== 'doctor') {
            // Nếu là user thường, chỉ xem được public
            query.visibility = 'public';
        } else if (user.role === 'doctor') {
            // Nếu là bác sĩ, xem được public và doctors
            query.visibility = { $in: ['public', 'doctors'] };
        }
        // Admin có thể xem tất cả, không cần filter visibility
        console.log('Query to execute:', JSON.stringify(query));

        // Xác định cách sắp xếp
        let sortOption: any = {};

        // Sắp xếp theo trường được chọn
        if (sortBy === 'likes') {
            // Sắp xếp theo số lượt thích (sử dụng aggregation để đếm số phần tử trong mảng likes)
            const blogs = await Blog.aggregate([
                { $match: query },
                { $addFields: { likesCount: { $size: "$likes" } } },
                { $sort: { likesCount: order === 'asc' ? 1 : -1 } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'author',
                        foreignField: '_id',
                        as: 'authorInfo'
                    }
                },
                { $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        content: 1,
                        author: 1,
                        "authorInfo.username": 1,
                        specialization: 1,
                        media: 1,
                        likes: 1,
                        likesCount: 1,
                        unlikes: 1,
                        comments: 1,
                        visibility: 1,
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ]);

            res.json(blogs);
            return;
        } else {
            // Sắp xếp theo createdAt hoặc trường khác
            sortOption[sortBy as string] = order === 'asc' ? 1 : -1;

            const blogsWithoutPopulate = await Blog.find(query);
            console.log('Blogs found (without populate):', blogsWithoutPopulate.length);

            const blogs = await Blog.find(query)
                .populate({ path: 'author', model: 'user', select: 'username' })
                .populate({ path: 'comments.user', model: 'user', select: 'username' })
                .populate({ path: 'comments.replies.user', model: 'user', select: 'username' });

            res.json(blogs);
        }
    } catch (error) {
        console.error('Error in getAllBlogs:', error);
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        res.status(500).json({ message: 'Lỗi khi lấy danh sách blog', error });
    }
};

/**
 * @desc Lấy chi tiết 1 blog
 */
export const getBlogById = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.user as JwtPayload | undefined; // lấy từ req.user sau khi authenticate

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const blog = await Blog.findById(req.params.blogId)
            .populate({ path: 'author', model: 'user', select: 'username' })
            .slice('comments', [skip, limit])
            .populate({ path: 'comments.user', model: 'user', select: 'username imageUrl' })
            .populate({ path: 'comments.replies.user', model: 'user', select: 'username imageUrl' });
        if (!blog) {
            res.status(404).json({ message: 'Không tìm thấy blog' });
            return; // Kết thúc hàm tại đây
        }

        if (blog.visibility === 'private' && (!user || (user.id !== blog.author.toString() && user.role !== 'admin'))) {
            res.status(403).json({ message: 'Bạn không có quyền xem blog này' });
            return;
        }

        if (blog.visibility === 'doctors' && (!user || (user.role !== 'doctor' && user.role !== 'admin'))) {
            res.status(403).json({ message: 'Chỉ bác sĩ mới có quyền xem blog này' });
            return;
        }
        res.json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy blog', error });
    }
};
/**
 * @desc Lấy danh sách blog của bác sĩ hiện tại
 */
export const getMyBlogs = async (req: Request, res: Response): Promise<void> => {
    const user = req.user as JwtPayload; // Lấy user đã authenticate từ req.user

    console.log('User Info:', user); // Log thông tin của user (để kiểm tra role và id)

    // Kiểm tra xem người dùng có phải là bác sĩ không
    if (user.role !== 'doctor') {
        console.log(`Unauthorized access: User is not a doctor. Role: ${user.role}`);
        res.status(403).json({ message: 'Chỉ bác sĩ mới có thể xem bài viết của mình' });
        return; // Không cần return Promise ở đây
    }

    try {
        // Kiểm tra xem user.id có tồn tại và là ObjectId hợp lệ không
        if (!user.id || !mongoose.Types.ObjectId.isValid(user.id)) {
            console.log(`Invalid User ID: ${user.id}`);
            res.status(400).json({ message: 'ID người dùng không hợp lệ' });
            return; // Không cần return Promise ở đây
        }

        // Log id của bác sĩ để kiểm tra
        console.log(`Fetching blogs for doctor with ID: ${user.id}`);

        // Lọc các bài viết mà bác sĩ đã đăng (theo author là bác sĩ hiện tại)
        const blogs = await Blog.find({ author: user.id }).populate({
            path: 'author',
            model: 'user',
            select: 'username'
        })
            .populate({
                path: 'comments.user',
                model: 'user',
                select: 'username'
            })
            .populate({
                path: 'comments.replies.user',
                model: 'user',
                select: 'username'
            });

        // Log số lượng bài viết tìm thấy
        console.log(`Found ${blogs.length} blog(s) for the doctor`);

        // Kiểm tra nếu bác sĩ không có bài viết nào
        if (blogs.length === 0) {
            console.log(`Doctor with ID ${user.id} has no blogs.`);
            res.status(404).json({ message: 'Bác sĩ chưa đăng bài viết nào' });
            return; // Không cần return Promise ở đây
        }

        // Log dữ liệu bài viết (hoặc một phần của nó)
        console.log('Blogs retrieved:', blogs.map(blog => blog.title)); // Chỉ log title để không quá dài

        res.json(blogs);  // Trả về danh sách bài viết của bác sĩ
    } catch (error) {
        console.error('Error in getMyBlogs:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách blog của bác sĩ', error });
        // Không cần return Promise ở đây
    }
};
/**
 * @desc Xóa blog (chỉ bác sĩ tạo blog hoặc admin mới được xóa)
 */
export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
    const user = req.user as JwtPayload;
    const blogId = req.params.blogId;

    try {
        const blog = await Blog.findById(blogId);

        if (!blog) {
            res.status(404).json({ message: 'Không tìm thấy blog' });
            return;
        }

        if (user.role !== 'admin' && blog.author.toString() !== user.id) {
            res.status(403).json({ message: 'Không có quyền xóa bài viết này' });
            return;
        }

        // Xóa tất cả các file media liên quan
        blog.media.forEach(mediaItem => {
            const filePath = getAbsoluteMediaPath(mediaItem.url);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Đã xóa file: ${filePath}`);
                } else {
                    console.log(`File không tồn tại: ${filePath}`);
                }
            } catch (err) {
                console.error(`Lỗi khi xóa file ${filePath}:`, err);
            }
        });

        // Xóa blog từ database
        await Blog.findByIdAndDelete(blogId);

        res.json({ message: 'Đã xóa blog và các media liên quan thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa blog:', error);
        res.status(500).json({ message: 'Lỗi khi xóa blog', error });
    }
};
export const updateBlog = async (req: Request, res: Response): Promise<void> => {
    const user = req.user as JwtPayload;
    const { title, content, visibility, keepMedia } = req.body;
    const files = req.files as Express.Multer.File[] || [];
    const blogId = req.params.blogId;
    const MAX_MEDIA_PER_BLOG = 1;
    // Thêm ngay sau khi khai báo MAX_MEDIA_PER_BLOG = 1
    const deleteMediaFile = (mediaItem: any) => {
        try {
            const filePath = getAbsoluteMediaPath(mediaItem.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Đã xóa file: ${filePath}`);
            }
        } catch (err) {
            console.error(`Lỗi xóa file ${mediaItem.url}:`, err);
        }
    };

    try {
        const blog = await Blog.findById(blogId);

        if (!blog) {
            res.status(404).json({ message: 'Không tìm thấy blog' });
            return;
        }

        if (user.role !== 'admin' && blog.author.toString() !== user.id) {
            res.status(403).json({ message: 'Không có quyền cập nhật bài viết này' });
            return;
        }

        // Xử lý media mới
        const newMediaFiles = files.map(file => ({
            url: getMediaPath(file.filename),
            type: file.mimetype.startsWith('image/') ? 'image' : 'video'
        }));

        // Nhận danh sách ID media cần xóa từ client
        const deletedMediaIds: string[] = req.body.deletedMedia ? JSON.parse(req.body.deletedMedia) : [];

        // Xóa media được đánh dấu
        deletedMediaIds.forEach(url => { // Giả sử client gửi URL để xóa
            const mediaToDelete = blog.media.find(m => m.url === url);
            if (mediaToDelete) deleteMediaFile(mediaToDelete);
        });

        // Xử lý keepMedia
        let keepMediaIds: number[] = [];
        if (keepMedia) {
            try {
                keepMediaIds = JSON.parse(keepMedia);
            } catch (e) {
                console.error('Lỗi khi parse keepMedia:', e);
                keepMediaIds = Array.isArray(keepMedia) ? keepMedia.map(Number) : [];
            }
        }
        const keptMediaUrls: string[] = req.body.keptMedia
            ? JSON.parse(req.body.keptMedia)
            : [];

        // Giữ lại media cũ được chỉ định
        const keptMedia = blog.media.filter(mediaItem =>
            keptMediaUrls.includes(mediaItem.url) &&
            !deletedMediaIds.includes(mediaItem.url)
        );

        // Xóa các file media không được giữ lại
        blog.media.forEach(mediaItem => {
            if (!keptMediaUrls.includes(mediaItem.url) || deletedMediaIds.includes(mediaItem.url)) {
                deleteMediaFile(mediaItem);
            }
        });

        // Xử lý thêm media từ req.body.media (URLs)
        let additionalMedia: { url: string; type: 'image' | 'video' }[] = [];
        if (req.body.media) {
            try {
                const mediaData = typeof req.body.media === 'string'
                    ? JSON.parse(req.body.media)
                    : req.body.media;

                if (Array.isArray(mediaData)) {
                    additionalMedia = mediaData
                        .filter(item =>
                            typeof item === 'object' &&
                            item !== null &&
                            typeof item.url === 'string' &&
                            ['image', 'video'].includes(item.type)
                        )
                        .map(item => ({
                            url: item.url,
                            type: item.type as 'image' | 'video'
                        }));
                }
            } catch (e) {
                console.error('Lỗi khi parse media:', e);
            }
        }
        // Validation media
        const currentMediaCount = keptMedia.length;
        const newFilesCount = newMediaFiles.length;

        if (currentMediaCount + newFilesCount > MAX_MEDIA_PER_BLOG) {
            // Xóa các file mới đã upload
            newMediaFiles.forEach(deleteMediaFile);
            res.status(400).json({
                message: `Mỗi blog chỉ được phép có tối đa ${MAX_MEDIA_PER_BLOG} ảnh/video`
            });
            return;
        }

        // Kết hợp tất cả media
        let updatedMedia = [
            ...keptMedia,
            ...newMediaFiles,
        ];

        if (updatedMedia.length > MAX_MEDIA_PER_BLOG) {
            const mediaToDelete = updatedMedia.slice(MAX_MEDIA_PER_BLOG);
            mediaToDelete.forEach(deleteMediaFile);
            updatedMedia = updatedMedia.slice(0, MAX_MEDIA_PER_BLOG);
        }

        // Cập nhật blog
        const updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            {
                title: title || blog.title,
                content: content || blog.content,
                specialization: blog.specialization,
                media: updatedMedia,
                visibility: visibility || blog.visibility,
                updatedAt: new Date()
            },
            { new: true }
        ).populate({ path: 'author', model: 'user', select: 'username' })
            .populate({ path: 'comments.user', model: 'user', select: 'username' })
            .populate({ path: 'comments.replies.user', model: 'user', select: 'username' });

        if (!updatedBlog) {
            res.status(404).json({ message: 'Không thể cập nhật blog' });
            return;
        }

        console.log('Blog đã được cập nhật:', updatedBlog);

        res.json(updatedBlog);
    } catch (error) {
        console.error('Lỗi khi cập nhật blog:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật blog', error });
    }
};
export const reactToBlog = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const blogId = req.params.blogId;
    const action = req.params.action; // "like" hoặc "unlike"

    try {
        const blog = await Blog.findById(blogId);

        if (!blog) {
            res.status(404).json({ message: "Không tìm thấy bài viết." });
            return;
        }

        const userIdStr = userId.toString();
        if (action === "like") {
            const alreadyLiked = blog.likes.some(id => id.toString() === userIdStr);

            if (alreadyLiked) {
                // Nếu đã like → bỏ like
                blog.likes = blog.likes.filter(id => id.toString() !== userIdStr);
            } else {
                // Thêm like và xóa khỏi unlike nếu có
                blog.likes.push(userId);
                blog.unlikes = blog.unlikes.filter(id => id.toString() !== userIdStr);
            }

        } else if (action === "unlike") {
            const alreadyUnliked = blog.unlikes.some(id => id.toString() === userIdStr);
            if (blog.unlikes.includes(userId)) {
                // Nếu đã unlike → bỏ unlike
                blog.unlikes = blog.unlikes.filter(id => id.toString() !== userIdStr);
            } else {
                // Thêm unlike và xóa khỏi like nếu có
                blog.unlikes.push(userId);
                blog.likes = blog.likes.filter(id => id.toString() !== userIdStr);
            }

        } else {
            res.status(400).json({ message: "Hành động không hợp lệ. Chỉ hỗ trợ 'like' hoặc 'unlike'." });
        }

        const updatedBlog = await blog.save();

        res.status(200).json({
            message: `Đã cập nhật trạng thái ${action}`,
            likesCount: updatedBlog.likes.length,
            unlikesCount: updatedBlog.unlikes.length
        });
    } catch (error) {
        console.error("Error reacting to blog:", error);
        res.status(500).json({ message: "Lỗi khi xử lý hành động với bài viết." });
    }
};

export const getSpecializations = async (req: Request, res: Response): Promise<void> => {
    try {
        const specializations = await Blog.distinct('specialization');
        res.json(specializations.filter(Boolean));
    } catch (err) {
        res.status(500).json({ message: err });
    }
};
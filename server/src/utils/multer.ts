import multer from 'multer';
import path from 'path';
import fs from "fs";
import { NextFunction, Request, Response } from 'express';

// Sử dụng đường dẫn tuyệt đối đến thư mục src
const rootDir = path.resolve();  // Đường dẫn đến thư mục src
const uploadsDir = path.join(rootDir, 'src/uploads');
const mediaDir = path.join(uploadsDir, 'files');

// Tạo thư mục uploads và media nếu chưa tồn tại
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Đã tạo thư mục: ${uploadsDir}`);
}
if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
    console.log(`Đã tạo thư mục: ${mediaDir}`);
}

// Log đường dẫn để kiểm tra
console.log('Thư mục uploads:', uploadsDir);
console.log('Thư mục media:', mediaDir);

const mediaStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Sử dụng đường dẫn tuyệt đối đến thư mục src/uploads/files
        cb(null, mediaDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Filter cho media files
const mediaFileFilter = (req: any, file: any, cb: any) => {
    // Danh sách các mime types cho ảnh
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    // Danh sách các mime types cho video
    const videoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];

    if ([...imageTypes, ...videoTypes].includes(file.mimetype)) {
        // Thêm thuộc tính mediaType để sử dụng sau này
        file.mediaType = imageTypes.includes(file.mimetype) ? 'image' : 'video';
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP) hoặc video (MP4, MPEG, MOV, WEBM)'), false);
    }
};

// Cấu hình multer cho upload media
const mediaUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: mediaFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

const csvStorage = multer.memoryStorage();
const csvFileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype === 'text/csv' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
        console.log('Đã nhận file hợp lệ:', file.mimetype);
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file CSV'), false);
    }
};

export const fileUpload = multer({
    storage: csvStorage,
    fileFilter: csvFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB
});

// Middleware kết hợp upload và xử lý lỗi
export const uploadMedia = (req: Request, res: Response, next: NextFunction) => {
    // Đảm bảo thư mục tồn tại trước khi upload
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(mediaDir)) {
        fs.mkdirSync(mediaDir, { recursive: true });
    }

    console.log('Bắt đầu upload file...');
    console.log('Thư mục lưu trữ:', mediaDir);

    const upload = mediaUpload.array('newFiles[]', 5); // cho phép nhiều ảnh/video

    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Lỗi từ multer
            console.error('Lỗi Multer:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    message: 'File quá lớn. Kích thước tối đa là 10MB cho mỗi file'
                });
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    message: 'Số lượng file vượt quá giới hạn cho phép'
                });
            }
            return res.status(400).json({ message: err.message });
        }

        if (err) {
            // Lỗi từ file filter
            console.error('Lỗi khác:', err);
            return res.status(400).json({ message: err.message });
        }

        console.log('Upload thành công:', req.files);
        next();
    });
};

// Error handling middleware
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        // Lỗi từ multer
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File quá lớn. Kích thước tối đa là 10MB cho mỗi file'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                message: 'Số lượng file vượt quá giới hạn cho phép'
            });
        }
        return res.status(400).json({ message: err.message });
    }

    if (err) {
        // Lỗi từ file filter
        return res.status(400).json({ message: err.message });
    }

    next();
};

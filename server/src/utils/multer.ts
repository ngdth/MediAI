import multer from 'multer';
import path from 'path';
import fs from "fs";
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from "uuid";
import streamifier from "streamifier";
import bucket from "../config/firebase";

// Sử dụng đường dẫn tuyệt đối đến thư mục src
const rootDir = path.resolve();  // Đường dẫn đến thư mục src
const uploadsDir = path.join(rootDir, 'src/uploads');
const mediaDir = path.join(uploadsDir, 'files');

const firebaseStorage = multer.memoryStorage();

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
export const mediaUpload = multer({
    storage: mediaStorage,
    fileFilter: mediaFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB cho cả ảnh và video
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

const uploadFirebase = multer({
    storage: firebaseStorage,
    fileFilter: mediaFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).array("newFiles[]", 5);


// Middleware kết hợp upload và xử lý lỗi
export const uploadMedia = (req: Request, res: Response, next: NextFunction) => {
    uploadFirebase(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error("Multer error:", err);
            return res.status(400).json({ message: err.message });
        } else if (err) {
            console.error("Upload filter error:", err);
            return res.status(400).json({ message: err.message });
        }

        if (!req.files || !(req.files instanceof Array)) {
            return res.status(400).json({ message: "Không có file nào được gửi lên" });
        }

        try {
            const uploadedMedia: { url: string; type: string }[] = [];

            for (const file of req.files) {
                const fileName = `media/${uuidv4()}-${file.originalname}`;
                const firebaseFile = bucket.file(fileName);

                const stream = firebaseFile.createWriteStream({
                    metadata: { contentType: file.mimetype },
                });

                await new Promise<void>((resolve, reject) => {
                    stream.on("error", (err) => {
                        console.error("Firebase upload error:", err);
                        reject(err);
                    });

                    stream.on("finish", async () => {
                        await firebaseFile.makePublic();
                        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${firebaseFile.name}`;
                        
                        uploadedMedia.push({
                            url: publicUrl,
                            type: file.mimetype.startsWith("image/") ? "image" : "video"
                        });
                    
                        resolve();
                    });

                    streamifier.createReadStream(file.buffer).pipe(stream);
                });
            }

            // Lưu kết quả vào req để controller sau dùng
            (req as any).mediaUrls = uploadedMedia;

            console.log("Upload thành công:", uploadedMedia);
            next();
        } catch (uploadErr: any) {
            console.error("Lỗi khi upload Firebase:", uploadErr.message);
            res.status(500).json({ message: "Lỗi khi upload lên Firebase", error: uploadErr.message });
        }
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

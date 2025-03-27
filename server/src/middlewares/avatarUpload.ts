import multer from "multer";
import path from "path";
import fs from "fs";

// Định nghĩa thư mục lưu ảnh
const uploadDir = "../client/public/uploads/avatars";

// Kiểm tra nếu thư mục chưa tồn tại thì tạo mới
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Lưu vào thư mục đã tạo
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Đặt tên file tránh trùng lặp
    },
});

// Kiểm tra định dạng file
import { Request } from "express";

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Chỉ chấp nhận các định dạng ảnh JPG, JPEG, PNG"));
    }
};

// Giới hạn kích thước ảnh tối đa là 2MB
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export default upload;

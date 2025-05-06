import multer from "multer";
import path from "path";
import fs from "fs";

// Định nghĩa thư mục lưu ảnh
const uploadDir = "../client/public/uploads/avatars";
const uploadTestDir = "../client/public/uploads/tests";

// Kiểm tra nếu thư mục chưa tồn tại thì tạo mới
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Kiểm tra nếu thư mục chưa tồn tại thì tạo mới
if (!fs.existsSync(uploadTestDir)) {
    fs.mkdirSync(uploadTestDir, { recursive: true });
}

// Middleware tự động chọn thư mục dựa trên field name
const storage = multer.memoryStorage();

// Kiểm tra định dạng file
import { Request } from "express";

// Kiểm tra định dạng file
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error("Chỉ chấp nhận JPG, JPEG, PNG"));
};

// Giới hạn kích thước ảnh tối đa là 2MB
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export default upload;

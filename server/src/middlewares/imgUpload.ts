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
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "avatar") {
            cb(null, uploadDir);
        } else if (file.fieldname === "testImages") {
            cb(null, uploadTestDir);
        } else {
            cb(new Error("Field name không hợp lệ"), "");
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

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

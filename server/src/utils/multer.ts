import multer from 'multer';

const storage = multer.memoryStorage();
const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype === 'text/csv') {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file CSV'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB
});

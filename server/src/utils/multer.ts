import multer from 'multer';

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

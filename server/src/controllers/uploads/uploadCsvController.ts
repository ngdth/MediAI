import { Request, Response } from 'express';
import csv from 'csvtojson';
import User from '../../models/User';

export const uploadCSV = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Bắt đầu xử lý file upload...');

        if (!req.file) {
            console.log('Không có file được tải lên');
            res.status(400).json({ message: 'Vui lòng tải lên file CSV' });
            return;
        }

        console.log(`Nhận file: ${req.file.originalname}`);

        const jsonArray = await csv({
            checkType: true,
            trim: true
        }).fromString(req.file.buffer.toString());

        console.log('Đã chuyển đổi CSV thành JSON:', jsonArray);

        const users = await User.insertMany(jsonArray, { ordered: false });

        console.log(`Đã nhập thành công ${users.length} bản ghi`);
        res.status(200).json({
            message: `Nhập dữ liệu thành công - ${users.length} bản ghi`,
            data: users
        });
    } catch (error: any) {
        console.error('Lỗi trong quá trình xử lý:', error);
        res.status(500).json({
            message: error.message || 'Lỗi server',
            details: error
        });
    }
};
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find();
        console.log('Danh sách users:', users);
        res.json(users);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách users:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
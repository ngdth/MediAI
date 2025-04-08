import { Request, Response } from 'express';
import csv from 'csvtojson';
import * as XLSX from 'xlsx';
import User from '../../models/User';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Bắt đầu xử lý file upload...');

        if (!req.file) {
            console.log('Không có file được tải lên');
            res.status(400).json({ message: 'Vui lòng tải lên file CSV hoặc Excel' });
            return;
        }

        console.log(`Nhận file: ${req.file.originalname}`);

        // const jsonArray = await csv({
        //     checkType: true,
        //     trim: true
        // }).fromString(req.file.buffer.toString());

        // console.log('Đã chuyển đổi CSV thành JSON:', jsonArray);
        
        let jsonArray: any[] = [];
        
        // Xử lý dựa trên loại file
        if (req.file.mimetype === 'text/csv') {
            // Xử lý file CSV
            jsonArray = await csv({
                checkType: true,
                trim: true
            }).fromString(req.file.buffer.toString());
            
            console.log('Đã chuyển đổi CSV thành JSON:', jsonArray);
        } else {
            // Xử lý file Excel
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Chuyển đổi sheet thành JSON
            jsonArray = XLSX.utils.sheet_to_json(worksheet);
            
            console.log('Đã chuyển đổi Excel thành JSON:', jsonArray);
        }

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
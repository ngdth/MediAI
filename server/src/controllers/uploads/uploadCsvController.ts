import { Request, Response } from 'express';
import csv from 'csvtojson';
import * as XLSX from 'xlsx';
import User, { Doctor, HeadOfDepartment, Nurse } from '../../models/User';

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

        const usernames = jsonArray.map(item => item.username);
        const emails = jsonArray.map(item => item.email);

        const existingUsers = await User.find({
            $or: [
                { username: { $in: usernames } },
                { email: { $in: emails } }
            ]
        });

        const existingUsernames = existingUsers.map(user => user.username);
        const existingEmails = existingUsers.map(user => user.email);

        console.log('Người dùng đã tồn tại:', existingUsernames);

        // Lọc ra người dùng chưa tồn tại
        const newUsers = jsonArray.filter(item =>
            !existingUsernames.includes(item.username) &&
            !existingEmails.includes(item.email)
        );

        if (newUsers.length === 0) {
            console.log('Tất cả người dùng đã tồn tại');
            res.status(400).json({
                message: 'Tất cả người dùng đã tồn tại trong hệ thống',
                insertedCount: 0
            });
            return;
        }

        console.log(`Số người dùng mới: ${newUsers.length}`);

        // Tạo các đối tượng người dùng dựa trên role
        const userPromises = newUsers.map(async (item) => {
            // Chuẩn bị dữ liệu cơ bản cho tất cả người dùng
            const baseUserData = {
                username: item.username,
                email: item.email,
                password: item.password,
                firstname: item.firstname || '',
                lastname: item.lastname || '',
                verified: true,
                active: true
            };

            try {
                let user;

                // Tạo người dùng dựa trên role
                switch (item.role) {
                    case 'doctor':
                        user = new Doctor({
                            ...baseUserData,
                            specialization: item.specialization || 'General',
                            experience: item.experience || 0
                        });
                        break;
                    case 'nurse':
                        user = new Nurse({
                            ...baseUserData,
                            specialization: item.specialization || 'General',
                            experience: item.experience || 0
                        });
                        break;
                    case 'head of department':
                        user = new HeadOfDepartment({
                            ...baseUserData,
                            specialization: item.specialization || 'General',
                            experience: item.experience || 0
                        });
                        break;
                    default:
                        user = new User({
                            ...baseUserData,
                            role: 'user'
                        });
                }

                return await user.save();
            } catch (error) {
                console.error(`Lỗi khi lưu người dùng ${item.username}:`, error);
                return null;
            }
        });

        // Chờ tất cả các promise hoàn thành
        const results = await Promise.allSettled(userPromises);

        // Đếm số lượng người dùng đã thêm thành công
        const successfulUsers = results.filter(result => result.status === 'fulfilled' && result.value !== null);

        console.log(`Đã nhập thành công ${successfulUsers.length} bản ghi`);

        // Lấy thông tin chi tiết về các lỗi
        const failedUsers = results
            .filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && result.value === null))
            .map((result, index) => {
                if (result.status === 'rejected') {
                    return {
                        user: newUsers[index],
                        error: result.reason
                    };
                }
                return {
                    user: newUsers[index],
                    error: 'Không thể lưu người dùng'
                };
            });

        if (failedUsers.length > 0) {
            console.log('Người dùng thất bại:', failedUsers);
        }

        res.status(200).json({
            message: `Nhập dữ liệu thành công - ${successfulUsers.length}/${newUsers.length} bản ghi`,
            insertedCount: successfulUsers.length,
            failedCount: failedUsers.length,
            failedUsers: failedUsers.map(f => f.user.username)
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
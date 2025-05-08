import { Request, Response } from 'express';
import csv from 'csvtojson';
import * as XLSX from 'xlsx';
import User, { Doctor, HeadOfDepartment, Nurse } from '../../models/User';
import axios from 'axios';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Bắt đầu xử lý file upload...');

        if (!req.file) {
            console.log('Không có file được tải lên');
            res.status(400).json({ message: 'Vui lòng tải lên file CSV hoặc Excel' });
            return;
        }

        console.log(`Nhận file: ${req.file.originalname}`);

        let jsonArray: any[] = [];

        // Xử lý dựa trên loại file
        if (req.file.mimetype === 'text/csv') {
            // Xử lý file CSV
            jsonArray = await csv({
                checkType: true,
                trim: true
            }).fromString(req.file.buffer.toString());

            console.log('Đã chuyển đổi CSV thành JSON:', jsonArray);
        } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || req.file.mimetype === 'application/vnd.ms-excel') {
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonArray = XLSX.utils.sheet_to_json(worksheet);
            console.log('Đã chuyển đổi Excel thành JSON:', jsonArray);
        } else {
            res.status(400).json({ message: 'Định dạng file không được hỗ trợ' });
            return;
        }

        if (jsonArray.length === 0 || (jsonArray.length === 1 && Object.keys(jsonArray[0]).every(key => jsonArray[0][key] === ''))) {
            console.log('File chỉ chứa tiêu đề, không có dữ liệu để nhập');
            res.status(400).json({
                message: 'File chỉ chứa tiêu đề cột, không có dữ liệu để nhập.',
                insertedCount: 0
            });
            return;
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
                gender: item.gender,
                role: item.role || 'user',
                specialization: item.specialization || 'General',
                experience: item.experience || 0,
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

export const exportUsersToExcel = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Bắt đầu xuất tiêu đề và dữ liệu role ra Excel...');

        // Lấy token từ header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Không có token xác thực' });
            return;
        }

        // Lấy role từ query parameter
        const role = req.query.role?.toString().toLowerCase();
        console.log(`Role nhận được từ query: ${role}`);

        if (!role || !['doctor', 'head of department', 'nurse'].includes(role)) {
            console.log(`Role không hợp lệ: ${role}`);
            res.status(400).json({ message: 'Vai trò không hợp lệ. Phải là doctor, head of department, hoặc nurse.' });
            return;
        }

        // Xác định API dựa trên role
        let apiEndpoint;
        switch (role) {
            case 'doctor':
                apiEndpoint = '/user/doctors';
                break;
            case 'head of department':
                apiEndpoint = '/user/hods';
                break;
            case 'nurse':
                apiEndpoint = '/admin/nurses';
                break;
            default:
                throw new Error('Vai trò không được hỗ trợ');
        }

        // Kiểm tra và lấy base URL, cung cấp giá trị mặc định nếu không có
        const baseUrl = process.env.VITE_BE_URL || 'http://localhost:8080';
        if (!process.env.VITE_BE_URL) {
            console.warn('VITE_BE_URL không được định nghĩa trong biến môi trường. Sử dụng giá trị mặc định:', baseUrl);
        }

        // Gọi API tương ứng
        const apiUrl = `${baseUrl}${apiEndpoint}`;
        console.log(`Gọi API: ${apiUrl}`);
        const response = await axios.get(apiUrl, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const users = response.data;
        console.log(`Dữ liệu trả về từ API (${role}):`, users);

        let excelData: any[] = [];
        // Chuẩn bị dữ liệu: ngay cả khi không có người dùng, vẫn tạo file với tiêu đề
        if (Array.isArray(users)) {
            excelData = users.length > 0
                ? users.map(user => ({
                    username: '',
                    email: '',
                    password: '',
                    specialization: '',
                    gender: '',
                    experience: '',
                    role: (user as any).role || role,
                }))
                : [{
                    username: '',
                    email: '',
                    password: '',
                    specialization: '',
                    gender: '',
                    experience: '',
                    role: '',
                }];
        } else {
            console.warn('Dữ liệu từ API không phải là một mảng:', users);
            res.status(500).json({ message: 'Dữ liệu không hợp lệ từ API. Không thể xuất Excel.' });
            return;
        }

        // Tạo worksheet từ dữ liệu (không thêm headerRow, để json_to_sheet tự tạo tiêu đề)
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Tạo workbook và thêm worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

        // Tùy chỉnh tiêu đề cột (độ rộng)
        worksheet['!cols'] = [
            { wch: 20 }, // username
            { wch: 30 }, // email
            { wch: 10 }, // password
            { wch: 30 }, // specialization
            { wch: 10 }, // gender
            { wch: 10 }, // experience
            { wch: 15 }  // role
        ];

        // Chuyển workbook thành buffer
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        // Thiết lập header để tải file
        res.setHeader('Content-Disposition', `attachment; filename=${role.replace(/\s+/g, '_')}_template.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        console.log(`Đã tạo file Excel chứa tiêu đề và dữ liệu role (${role}) thành công, số bản ghi: ${users.length}`);

        // Gửi file về client
        res.status(200).send(buffer);
    } catch (error: any) {
        console.error('Lỗi khi xuất dữ liệu ra Excel:', error);
        res.status(500).json({
            message: error.message || 'Lỗi server khi xuất file Excel',
            details: error.stack || error
        });
    }
};
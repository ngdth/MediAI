import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { HeadOfDepartment, IHeadOfDepartment } from "../../models/User";
import User from "../../models/User";
import mongoose from "mongoose";

export const getAllHOD = async (req: Request, res: Response): Promise<void> => {
    try {
        // Lấy danh sách tất cả user có role là "trưởng khoa"
        const doctors = await User.find({ role: "head of department" }).select("-password").populate("specializationId");

        if (!doctors.length) {
            res.status(404).json({ error: "Không tìm thấy trưởng khoa nào." });
            return;
        }

        res.status(200).json(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        console.log("Error fetching doctors:", error);
        res.status(500).json({ error: "Không thể lấy danh sách trưởng khoa." });
    }
};

export const getHODById = async (req: Request, res: Response): Promise<void> => {
    try {
        const headId = req.params.headId;

        const doctor = await HeadOfDepartment.findById(headId).select("-password");

        // Nếu vẫn không tìm thấy
        if (!doctor) {
            res.status(404).json({ error: "Không tìm thấy bác sĩ hoặc trưởng khoa." });
            return;
        }

        // Nếu tìm thấy, trả về thông tin trưởng khoa
        res.status(200).json(doctor);
    } catch (error) {
        console.log("Failed to get head of department details: ", error);
        res.status(500).json({ error: "Không thể lấy chi tiết trưởng khoa." });
    }
};

export const searchHODByUsername = async (req: Request, res: Response): Promise<void> => {
    try {
        const { keyword } = req.query;

        if (!keyword || typeof keyword !== "string") {
            res.status(400).json({ error: "Keyword query parameter không được trống và phải là chuỗi." });
            return;
        }

        // Tìm kiếm user có role là "head of department" và username chứa keyword
        const doctor = await User.findOne({
            username: { $regex: keyword, $options: "i" }, // Tìm kiếm từ khóa (không phân biệt hoa/thường)
            role: "head of department", // Chỉ tìm kiếm head of department
        }).select("-password"); // Loại bỏ password trong kết quả

        if (!doctor || !doctor.username.length) {
            res.status(404).json({ error: "Không tìm thấy trưởng khoa nào." });
            return;
        }

        res.status(200).json(doctor);
    } catch (error) {
        console.error("Error searching head of department by username:", error);
        res.status(500).json({ error: "Không thể tìm kiếm trưởng khoa theo tên." });
    }
};

export const createHODAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, specialization, experience, gender } = req.body;

        if (!username || !email || !password || !specialization) {
            res.status(400).json({ error: "Thiếu các trường bắt buộc." });
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: "Email đã được sử dụng." });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newHead = new HeadOfDepartment({
            username,
            email,
            password: hashedPassword,
            specialization,
            experience,
            role: "head of department",
            gender,
        });

        await newHead.save();
        res.status(201).json({ message: "Tài khoản trưởng khoa đã được tạo thành công.", headOfDepartment: newHead });
    } catch (error) {
        console.error("Error creating Head of Department:", error);
        res.status(500).json({ error: "Không thể tạo tài khoản trưởng khoa." });
    }
};

export const updateHOD = async (req: Request, res: Response): Promise<void> => {
    try {
        const { hodId } = req.params;
        const { username, email, password, specialization, experience } = req.body;

        const head = await HeadOfDepartment.findById(hodId) as IHeadOfDepartment;
        if (!head) {
            res.status(404).json({ error: "Không tìm thấy trưởng khoa." });
            return;
        }

        if (username) head.username = username;
        if (email && email !== head.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({ error: "Email đã được sử dụng." });
                return;
            }
            head.email = email;
        }
        if (specialization) head.specialization = specialization;
        if (experience !== undefined) head.experience = experience;
        if (password) head.password = await bcrypt.hash(password, 10);

        await head.save();
        res.status(200).json({ message: "Cập nhật trưởng khoa thành công.", headOfDepartment: head });
    } catch (error) {
        console.error("Error updating Head of Department:", error);
        res.status(500).json({ error: "Không thể cập nhật trưởng khoa." });
    }
};

export const deleteHOD = async (req: Request, res: Response): Promise<void> => {
    try {
        const { hodId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(hodId)) {
            res.status(400).json({ error: "ID trưởng khoa không hợp lệ." });
            return;
        }

        const head = await User.findById(hodId);
        if (!head || head.role !== "head of department") {
            res.status(404).json({ error: "Không tìm thấy trưởng khoa." });
            return;
        }

        await User.findByIdAndDelete(hodId);
        res.status(200).json({ message: "Xóa trưởng khoa thành công." });
    } catch (error) {
        console.error("Error deleting Head of Department:", error);
        console.log("Error deleting Head of Department:", error);
        res.status(500).json({ error: "Không thể xóa trưởng khoa." });
    }
};

import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { HeadOfDepartment, IHeadOfDepartment } from "../../models/User";
import User from "../../models/User";
import mongoose from "mongoose";

export const getAllHOD = async (req: Request, res: Response): Promise<void> => {
    try {
        // Lấy danh sách tất cả user có role là "doctor"
        const doctors = await User.find({ role: "head of department" }).select("-password").populate("specializationId");

        if (!doctors.length) {
            res.status(404).json({ error: "No head of department found." });
            return;
        }

        res.status(200).json(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        console.log("Error fetching doctors:", error);
        res.status(500).json({ error: "Failed to fetch doctors." });
    }
};

export const getHODById = async (req: Request, res: Response): Promise<void> => {
    try {
        const headId = req.params.headId;

        const doctor = await HeadOfDepartment.findById(headId).select("-password");

        // Nếu vẫn không tìm thấy
        if (!doctor) {
            res.status(404).json({ error: "Doctor or Head of Department not found." });
            return;
        }

        // Nếu tìm thấy, trả về thông tin doctor
        res.status(200).json(doctor);
    } catch (error) {
        console.log("Failed to get head of department details: ", error);
        res.status(500).json({ error: "Failed to get head of department details." });
    }
};

export const searchHODByUsername = async (req: Request, res: Response): Promise<void> => {
    try {
        const { keyword } = req.query; // Lấy query parameter `username`

        if (!keyword || typeof keyword !== "string") {
            res.status(400).json({ error: "Keyword query parameter is required and must be a string." });
            return;
        }

        // Tìm kiếm user có role là "doctor" và username chứa keyword
        const doctor = await User.findOne({
            username: { $regex: keyword, $options: "i" }, // Tìm kiếm keyword (không phân biệt hoa/thường)
            role: "head of department", // Chỉ tìm kiếm head of department
        }).select("-password"); // Loại bỏ password trong kết quả

        if (!doctor || !doctor.username.length) {
            res.status(404).json({ error: "No head of department found." });
            return;
        }

        res.status(200).json(doctor);
    } catch (error) {
        console.error("Error searching head of department by username:", error);
        res.status(500).json({ error: "Failed to search for head of department by username." });
    }
};

export const createHODAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, specialization, experience, gender } = req.body;

        if (!username || !email || !password || !specialization) {
            res.status(400).json({ error: "Missing required fields." });
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: "Email already in use." });
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
        res.status(201).json({ message: "Head of Department account created successfully.", headOfDepartment: newHead });
    } catch (error) {
        console.error("Error creating Head of Department:", error);
        res.status(500).json({ error: "Failed to create Head of Department." });
    }
};

export const updateHOD = async (req: Request, res: Response): Promise<void> => {
    try {
        const { hodId } = req.params;
        const { username, email, password, specialization, experience } = req.body;

        const head = await HeadOfDepartment.findById(hodId) as IHeadOfDepartment;
        if (!head) {
            res.status(404).json({ error: "Head of Department not found." });
            return;
        }

        if (username) head.username = username;
        if (email && email !== head.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({ error: "Email already in use." });
                return;
            }
            head.email = email;
        }
        if (specialization) head.specialization = specialization;
        if (experience !== undefined) head.experience = experience;
        if (password) head.password = await bcrypt.hash(password, 10);

        await head.save();
        res.status(200).json({ message: "Head of Department updated successfully.", headOfDepartment: head });
    } catch (error) {
        console.error("Error updating Head of Department:", error);
        res.status(500).json({ error: "Failed to update Head of Department." });
    }
};

export const deleteHOD = async (req: Request, res: Response): Promise<void> => {
    try {
        const { hodId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(hodId)) {
            res.status(400).json({ error: "Invalid Head of Department ID." });
            return;
        }

        const head = await User.findById(hodId);
        if (!head || head.role !== "head of department") {
            res.status(404).json({ error: "Head of Department not found." });
            return;
        }

        await User.findByIdAndDelete(hodId);
        res.status(200).json({ message: "Head of Department deleted successfully." });
    } catch (error) {
        console.error("Error deleting Head of Department:", error);
        console.log("Error deleting Head of Department:", error);
        res.status(500).json({ error: "Failed to delete Head of Department." });
    }
};


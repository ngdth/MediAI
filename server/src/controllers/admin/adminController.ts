import bcrypt from "bcrypt";
import { Request, Response } from "express";
import User, { Doctor, IDoctor, IUser } from "../../models/User";
import mongoose from "mongoose";

export const createDoctorAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, specialization, experience } = req.body;

        // Check required fields
        if (!username || !email || !password || !specialization) {
            res.status(400).json({ error: "Missing required fields." });
            return;
        }

        // Check email already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: "Email already in use." });
            return;
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create doctor account
        const newDoctor = new Doctor({
            username,
            email,
            password: hashedPassword,
            role: "doctor",
            specialization,
            experience: experience || 0, // Default 0 if not provided
        });

        await newDoctor.save();

        res.status(201).json({ message: "Doctor account created successfully.", doctor: newDoctor });
    } catch (error) {
        console.error("Error creating doctor account:", error);
        res.status(500).json({ error: "Failed to create doctor account." });
    }
};

export const updateDoctorAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctorId = req.params.doctorId;
        const { username, email, password, specialization, experience } = req.body;

        // Tìm bác sĩ cần cập nhật
        const doctor = await Doctor.findById(doctorId) as IDoctor;
        if (!doctor) {
            res.status(404).json({ error: "Doctor not found." });
            return;
        }

        // Cập nhật thông tin nếu có
        if (username) doctor.username = username;
        if (email) doctor.email = email;
        if (specialization) doctor.specialization = specialization;
        if (experience !== undefined) doctor.experience = experience;

        // Check email already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: "Email already in use." });
            return;
        }

        // Nếu có password mới, hash lại trước khi lưu
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            doctor.password = hashedPassword;
        }

        // Lưu thông tin cập nhật
        await doctor.save();

        res.status(200).json({ message: "Doctor account updated successfully.", doctor });
    } catch (error) {
        console.error("Error updating doctor account:", error);
        res.status(500).json({ error: "Failed to update doctor account." });
    }
};

export const deleteDoctorAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctorId = req.params.doctorId;

        // Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            res.status(400).json({ error: "Invalid doctor ID." });
            return;
        }

        // Tìm bác sĩ trong database
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== "doctor") {
            res.status(404).json({ error: "Doctor not found." });
            return;
        }

        // Xóa bác sĩ
        await User.findByIdAndDelete(doctorId);
        res.status(200).json({ message: "Doctor account deleted successfully." });
    } catch (error) {
        console.error("Error deleting doctor account:", error);
        res.status(500).json({ error: "Failed to delete doctor account." });
    }
};
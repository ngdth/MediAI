import { Request, Response } from "express";
import User, { IUser } from "../../models/User";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export const createDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, specialization, experienceYears } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!username || !email || !password || !specialization) {
            res.status(400).json({ error: "Missing required fields." });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10); // 10 là số vòng mã hóa
        // Tạo một tài liệu mới với discriminator "Doctor"
        const newDoctor = new User({
            username,
            email,
            password: hashedPassword,
            role: "doctor", // Đặt role là "doctor"
            specialization, // Đặc thù của Doctor
            experienceYears, // Đặc thù của Doctor
        });
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            res.status(400).json({ error: "Email or username already exists." });
            return;
        }
        // Lưu tài liệu vào cơ sở dữ liệu
        await newDoctor.save();

        res.status(201).json({ message: "Doctor created successfully.", doctor: newDoctor });
    } catch (error) {
        console.error("Error creating doctor:", error);
        res.status(500).json({ error: "Failed to create doctor." });
    }
};

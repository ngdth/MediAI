import { Request, Response } from "express";
import User from "../../models/User";
import { sendEmail } from "../../config/email";

// API: View user profile
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user.id; // Take user id from request
        const user = await User.findById(userId).select("-password"); // Don't return password
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// API: View all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find().select("-password"); // Don't return password
        res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// API: View user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getUserByIdForUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const sendContactMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin." });
            return;
        }

        const admin = await User.findOne({ role: "admin" });

        if (!admin || !admin.email) {
            res.status(500).json({ message: "Không tìm thấy email admin để gửi." });
            return;
        }

        await sendEmail(
            admin.email,
            { name, email, phone, subject, message },
            "contact"
        );

        res.status(200).json({ message: "Gửi yêu cầu thành công!" });

    } catch (error) {
        console.error("Gửi email thất bại:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi gửi email." });
    }
};

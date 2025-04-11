import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import User from "../../models/User";

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

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user.id; // Lấy user id từ request
        const { username, email, firstName, lastName, birthday, gender, address, city, country, phone } = req.body;

        // Cập nhật thông tin người dùng
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                username,
                email,
                firstName,
                lastName,
                birthday,
                gender,
                address,
                city,
                country,
                phone,
            },
            { new: true } // Trả về user sau khi cập nhật
        );

        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({ user: updatedUser });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// API: Update user avatar
export const updateAvatar = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "Không có file nào được tải lên." });
            return;
        }

        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: "User không tồn tại." });
            return;
        }

        // Delete the physical file
        const uploadsDir = path.join(__dirname, process.env.UPLOADS_DIR_AVATARS || '../../../../client/public');
        
        // Nếu user đã có avatar cũ thì xóa ảnh cũ
        if (user.imageUrl) {
            const oldAvatarPath = path.join(uploadsDir, user.imageUrl);
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }

        // Lưu avatar mới
        user.imageUrl = `/uploads/avatars/${req.file.filename}`;
        await user.save();

        res.json({ imageUrl: user.imageUrl });
    } catch (error) {
        console.error("Lỗi khi cập nhật avatar:", error);
        res.status(500).json({ message: "Có lỗi xảy ra khi cập nhật avatar." });
    }
};

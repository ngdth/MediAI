import { Request, Response } from "express";
import Doctor from "../../models/User";
import User from "../../models/User";
import mongoose from "mongoose";

export const getAllDoctors = async (req: Request, res: Response): Promise<void> => {
    try {
        // Lấy danh sách tất cả user có role là "doctor"
        const doctors = await User.find({ role: "doctor" }).select("-password").populate("specializationId");

        if (!doctors.length) {
            res.status(404).json({ error: "No doctors found." });
            return;
        }

        res.status(200).json(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ error: "Failed to fetch doctors." });
    }
};

export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctorId = req.params.doctorId;
        const doctor = await Doctor.findById(doctorId).select("-password").populate("specializationId");
        if (!doctor || doctor.role !== "doctor") {
            res.status(404).json({ error: "Doctor not found." });
            return;
        }
        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ error: "Failed to get doctor details." });
    }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({
            id: user._id,
            username: user.username,
            role: user.role,
            email: user.email,
        });
    } catch (error) {
        console.error("Error fetching current user:", error);
        res.status(500).json({ message: "Failed to fetch current user" });
    }
};

export const searchDoctorByUsername = async (req: Request, res: Response): Promise<void> => {
    try {
        const { keyword } = req.query; // Lấy query parameter `username`

        if (!keyword || typeof keyword !== "string") {
            res.status(400).json({ error: "Keyword query parameter is required and must be a string." });
            return;
        }

        // Tìm kiếm user có role là "doctor" và username chứa keyword
        const doctor = await User.findOne({
            username: { $regex: keyword, $options: "i" }, // Tìm kiếm keyword (không phân biệt hoa/thường)
            role: "doctor",
        }).select("-password"); // Loại bỏ password trong kết quả

        if (!doctor || !doctor.username.length) {
            res.status(404).json({ error: "No doctors found." });
            return;
        }

        res.status(200).json(doctor);
    } catch (error) {
        console.error("Error searching doctor by username:", error);
        res.status(500).json({ error: "Failed to search for doctor by username." });
    }
};

export const getFavoriteDoctors = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const user = await User.findById(userId).populate({
            path: "favorites",
            select: "-password", // Loại bỏ mật khẩu khi trả về dữ liệu
        });

        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        res.status(200).json({ favorites: user.favorites });
    } catch (error) {
        console.error("Error fetching favorite doctors:", error);
        res.status(500).json({ error: "Failed to fetch favorite doctors." });
    }
};

export const addDoctorToFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const doctorId = req.params.doctorId;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // Kiểm tra nếu doctorId có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            res.status(400).json({ error: "Invalid doctor ID." });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

        // Kiểm tra nếu bác sĩ đã có trong danh sách yêu thích
        if (user.favorites?.includes(doctorObjectId)) {
            res.status(400).json({ message: "Doctor already in favorites." });
            return;
        }

        user.favorites?.push(doctorObjectId);
        await user.save();

        res.status(200).json({ message: "Doctor added to favorites.", favorites: user.favorites });
    } catch (error) {
        console.error("Error adding doctor to favorites:", error);
        res.status(500).json({ error: "Failed to add doctor to favorites." });
    }
};

export const removeDoctorFromFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const doctorId = req.params.doctorId;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // Kiểm tra nếu doctorId có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            res.status(400).json({ error: "Invalid doctor ID." });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

        // Kiểm tra nếu bác sĩ có trong danh sách yêu thích không
        if (!user.favorites?.includes(doctorObjectId)) {
            res.status(400).json({ message: "Doctor not found in favorites." });
            return;
        }

        user.favorites = user.favorites.filter(id => !id.equals(doctorObjectId));
        await user.save();

        res.status(200).json({ message: "Doctor removed from favorites.", favorites: user.favorites });
    } catch (error) {
        console.error("Error removing doctor from favorites:", error);
        res.status(500).json({ error: "Failed to remove doctor from favorites." });
    }
};

export const getDoctorBlogs = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // const blogs = await Blog.find({ doctorId: id });
        // res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch doctor blogs." });
    }
};

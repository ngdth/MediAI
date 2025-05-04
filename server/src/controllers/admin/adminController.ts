import bcrypt from "bcrypt";
import { Request, Response } from "express";
import User, { Doctor, IDoctor, INurse, IPharmacy, Nurse, Pharmacy, HeadOfDepartment, IHeadOfDepartment } from "../../models/User";
import mongoose from "mongoose";

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        // Lấy danh sách tất cả user có role là "user"
        const users = await User.find({ role: "user" }).select("-password");

        if (!users.length) {
            res.status(404).json({ error: "No nurses found." });
            return;
        }

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users." });
    }
};

export const setUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        // Kiểm tra user có tồn tại không
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        // Đảo trạng thái active (ban = false, unban = true)
        user.active = !user.active;
        await user.save();

        res.status(200).json({ message: `User ${user.active ? "unbanned" : "banned"} successfully.` });
    } catch (error) {
        console.error("Error banning/unbanning user:", error);
        res.status(500).json({ error: "Failed to update user status." });
    }
};

export const createDoctorAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, specialization, experience, gender } = req.body;

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
            gender: gender || "Nam", // Default "not specified" if not provided
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
        if (email && email !== doctor.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({ error: "Email already in use." });
                return;
            }
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

export const getAllNurses = async (req: Request, res: Response): Promise<void> => {
    try {
        // Lấy danh sách tất cả user có role là "nurse"
        const nurses = await User.find({ role: "nurse" }).select("-password");

        if (!nurses.length) {
            res.status(404).json({ error: "No nurses found." });
            return;
        }

        res.status(200).json(nurses);
    } catch (error) {
        console.error("Error fetching nurses:", error);
        res.status(500).json({ error: "Failed to fetch nurses." });
    }
};

export const createNurseAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, specialization, experience, gender } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!username || !email || !password || !specialization) {
            res.status(400).json({ error: "Missing required fields." });
            return;
        }

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: "Email already in use." });
            return;
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo tài khoản nurse
        const newNurse = new Nurse({
            username,
            email,
            password: hashedPassword,
            specialization,
            role: "nurse",
            experience: experience || 0, // Default 0 if not provided
            gender: gender || "Nữ", // Default "not specified" if not provided
        });

        await newNurse.save();

        res.status(201).json({ message: "Nurse account created successfully.", nurse: newNurse });
    } catch (error) {
        console.error("Error creating nurse account:", error);
        res.status(500).json({ error: "Failed to create nurse account." });
    }
};

export const updateNurseAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const nurseId = req.params.nurseId;
        const { username, email, password, specialization, experience, gender } = req.body;

        // Tìm nurse cần cập nhật
        const nurse = await Nurse.findById(nurseId) as INurse;
        if (!nurse) {
            res.status(404).json({ error: "Nurse not found." });
            return;
        }

        // Cập nhật thông tin nếu có
        if (username) nurse.username = username;
        if (email) nurse.email = email;
        if (specialization) nurse.specialization = specialization;
        if (experience !== undefined) nurse.experience = experience;
        if (gender) nurse.gender = gender;

        // Kiểm tra email mới có bị trùng không
        if (email && email !== nurse.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({ error: "Email already in use." });
                return;
            }
        }

        // Nếu có password mới, mã hóa lại trước khi lưu
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            nurse.password = hashedPassword;
        }

        // Lưu thông tin cập nhật
        await nurse.save();

        res.status(200).json({ message: "Nurse account updated successfully.", nurse });
    } catch (error) {
        console.error("Error updating nurse account:", error);
        res.status(500).json({ error: "Failed to update nurse account." });
    }
};

export const deleteNurseAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const nurseId = req.params.nurseId;

        // Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(nurseId)) {
            res.status(400).json({ error: "Invalid nurse ID." });
            return;
        }

        // Tìm nurse trong database
        const nurse = await User.findById(nurseId);
        if (!nurse || nurse.role !== "nurse") {
            res.status(404).json({ error: "Nurse not found." });
            return;
        }

        // Xóa nurse
        await User.findByIdAndDelete(nurseId);
        res.status(200).json({ message: "Nurse account deleted successfully." });
    } catch (error) {
        console.error("Error deleting nurse account:", error);
        res.status(500).json({ error: "Failed to delete nurse account." });
    }
};

export const getAllPharmacy = async (req: Request, res: Response): Promise<void> => {
    try {
        const pharmacies = await Pharmacy.find().select("-password");
        res.status(200).json(pharmacies);
    } catch (error) {
        console.error("Error fetching pharmacies:", error);
        res.status(500).json({ error: "Failed to fetch pharmacies." });
    }
};

export const createPharmacy = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, pharmacyName, location } = req.body;

        if (!username || !email || !password || !pharmacyName || !location) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: "Email already in use." });
            return;
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        const newPharmacy = new Pharmacy({
            username,
            email,
            hashedPassword,
            pharmacyName,
            location,
            role: "pharmacy",
        });

        await newPharmacy.save();
        res.status(201).json({ message: "Pharmacy created successfully", pharmacy: newPharmacy });
    } catch (error) {
        console.error("Error creating pharmacy:", error);
        res.status(500).json({ error: "Failed to create pharmacy." });
    }
};

export const updatePharmacy = async (req: Request, res: Response): Promise<void> => {
    try {
        const pharmacyId = req.params.pharmacyId;
        const { username, email, password, pharmacyName, location } = req.body;
        

        const pharmacy = await Pharmacy.findById(pharmacyId) as IPharmacy;
        if (!pharmacy) {
            res.status(404).json({ error: "Pharmacy not found" });
            return;
        }

        // Kiểm tra email mới có bị trùng không
        if (email && email !== pharmacy.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({ error: "Email already in use." });
                return;
            }
        }
        pharmacy.username = username || pharmacy.username;
        pharmacy.pharmacyName = pharmacyName || pharmacy.pharmacyName;
        pharmacy.location = location || pharmacy.location;
        // Nếu có password mới, mã hóa lại trước khi lưu
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            pharmacy.password = hashedPassword;
        }

        await pharmacy.save();
        res.status(200).json({ message: "Pharmacy updated successfully", pharmacy });
    } catch (error) {
        console.error("Error updating pharmacy:", error);
        res.status(500).json({ error: "Failed to update pharmacy." });
    }
};

export const deletePharmacy = async (req: Request, res: Response): Promise<void> => {
    try {
        const pharmacyId = req.params.pharmacyId;
        const deletedPharmacy = await Pharmacy.findByIdAndDelete(pharmacyId);

        if (!deletedPharmacy) {
            res.status(404).json({ error: "Pharmacy not found" });
            return;
        }

        res.status(200).json({ message: "Pharmacy deleted successfully" });
    } catch (error) {
        console.error("Error deleting pharmacy:", error);
        res.status(500).json({ error: "Failed to delete pharmacy." });
    }
};

import bcrypt from "bcrypt";
import { Request, Response } from "express";
import User, { Doctor, IDoctor, INurse, IPharmacy, Nurse, Pharmacy, HeadOfDepartment, IHeadOfDepartment } from "../../models/User";
import mongoose from "mongoose";

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        // Lấy danh sách tất cả user có role là "user"
        const users = await User.find({ role: "user" }).select("-password");

        if (!users.length) {
            res.status(404).json({ error: "Không tìm thấy người dùng nào." });
            return;
        }

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Lỗi khi tải danh sách người dùng." });
    }
};

export const setUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        // Kiểm tra user có tồn tại không
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: "Không tìm thấy người dùng." });
            return;
        }

        // Đảo trạng thái active (ban = false, unban = true)
        user.active = !user.active;
        await user.save();

        res.status(200).json({ message: `Đã ${user.active ? "mở khóa" : "khóa"} tài khoản thành công.` });
    } catch (error) {
        console.error("Error banning/unbanning user:", error);
        res.status(500).json({ error: "Lỗi khi cập nhật trạng thái người dùng." });
    }
};

export const createDoctorAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, specialization, experience, gender } = req.body;

        // Check required fields
        if (!username || !email || !password || !specialization) {
            res.status(400).json({ error: "Thiếu các trường bắt buộc." });
            return;
        }

        // Check email already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: "Email đã được sử dụng." });
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
            experience: experience || 0,
            gender: gender || "Nam",
        });

        await newDoctor.save();

        res.status(201).json({ message: "Tạo tài khoản bác sĩ thành công.", doctor: newDoctor });
    } catch (error) {
        console.error("Error creating doctor account:", error);
        res.status(500).json({ error: "Lỗi khi tạo tài khoản bác sĩ." });
    }
};

export const updateDoctorAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctorId = req.params.doctorId;
        const { username, email, password, specialization, experience } = req.body;

        // Tìm bác sĩ cần cập nhật
        const doctor = await Doctor.findById(doctorId) as IDoctor;
        if (!doctor) {
            res.status(404).json({ error: "Không tìm thấy bác sĩ." });
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
                res.status(400).json({ error: "Email đã được sử dụng." });
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

        res.status(200).json({ message: "Cập nhật tài khoản bác sĩ thành công.", doctor });
    } catch (error) {
        console.error("Error updating doctor account:", error);
        res.status(500).json({ error: "Lỗi khi cập nhật tài khoản bác sĩ." });
    }
};

export const deleteDoctorAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctorId = req.params.doctorId;

        // Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            res.status(400).json({ error: "ID bác sĩ không hợp lệ." });
            return;
        }

        // Tìm bác sĩ trong database
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== "doctor") {
            res.status(404).json({ error: "Không tìm thấy bác sĩ." });
            return;
        }

        // Xóa bác sĩ
        await User.findByIdAndDelete(doctorId);
        res.status(200).json({ message: "Xóa tài khoản bác sĩ thành công." });
    } catch (error) {
        console.error("Error deleting doctor account:", error);
        res.status(500).json({ error: "Lỗi khi xóa tài khoản bác sĩ." });
    }
};

export const getAllNurses = async (req: Request, res: Response): Promise<void> => {
    try {
        // Lấy danh sách tất cả user có role là "nurse"
        const nurses = await User.find({ role: "nurse" }).select("-password");

        if (!nurses.length) {
            res.status(404).json({ error: "Không tìm thấy y tá nào." });
            return;
        }

        res.status(200).json(nurses);
    } catch (error) {
        console.error("Error fetching nurses:", error);
        res.status(500).json({ error: "Lỗi khi tải danh sách y tá." });
    }
};

export const createNurseAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, specialization, experience, gender } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!username || !email || !password || !specialization) {
            res.status(400).json({ error: "Thiếu các trường bắt buộc." });
            return;
        }

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: "Email đã được sử dụng." });
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
            experience: experience || 0,
            gender: gender || "Nữ",
        });

        await newNurse.save();

        res.status(201).json({ message: "Tạo tài khoản y tá thành công.", nurse: newNurse });
    } catch (error) {
        console.error("Error creating nurse account:", error);
        res.status(500).json({ error: "Lỗi khi tạo tài khoản y tá." });
    }
};

export const updateNurseAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const nurseId = req.params.nurseId;
        const { username, email, password, specialization, experience, gender } = req.body;

        // Tìm nurse cần cập nhật
        const nurse = await Nurse.findById(nurseId) as INurse;
        if (!nurse) {
            res.status(404).json({ error: "Không tìm thấy y tá." });
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
                res.status(400).json({ error: "Email đã được sử dụng." });
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

        res.status(200).json({ message: "Cập nhật tài khoản y tá thành công.", nurse });
    } catch (error) {
        console.error("Error updating nurse account:", error);
        res.status(500).json({ error: "Lỗi khi cập nhật tài khoản y tá." });
    }
};

export const deleteNurseAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const nurseId = req.params.nurseId;

        // Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(nurseId)) {
            res.status(400).json({ error: "ID y tá không hợp lệ." });
            return;
        }

        // Tìm nurse trong database
        const nurse = await User.findById(nurseId);
        if (!nurse || nurse.role !== "nurse") {
            res.status(404).json({ error: "Không tìm thấy y tá." });
            return;
        }

        // Xóa nurse
        await User.findByIdAndDelete(nurseId);
        res.status(200).json({ message: "Xóa tài khoản y tá thành công." });
    } catch (error) {
        console.error("Error deleting nurse account:", error);
        res.status(500).json({ error: "Lỗi khi xóa tài khoản y tá." });
    }
};

export const getAllPharmacy = async (req: Request, res: Response): Promise<void> => {
    try {
        const pharmacies = await Pharmacy.find().select("-password");
        res.status(200).json(pharmacies);
    } catch (error) {
        console.error("Error fetching pharmacies:", error);
        res.status(500).json({ error: "Lỗi khi tải danh sách nhà thuốc." });
    }
};

export const createPharmacy = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, pharmacyName, location } = req.body;

        if (!username || !email || !password || !pharmacyName || !location) {
            res.status(400).json({ error: "Tất cả các trường đều bắt buộc." });
            return;
        }

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: "Email đã được sử dụng." });
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
        res.status(201).json({ message: "Tạo nhà thuốc thành công.", pharmacy: newPharmacy });
    } catch (error) {
        console.error("Error creating pharmacy:", error);
        res.status(500).json({ error: "Lỗi khi tạo nhà thuốc." });
    }
};

export const updatePharmacy = async (req: Request, res: Response): Promise<void> => {
    try {
        const pharmacyId = req.params.pharmacyId;
        const { username, email, password, pharmacyName, location } = req.body;

        const pharmacy = await Pharmacy.findById(pharmacyId) as IPharmacy;
        if (!pharmacy) {
            res.status(404).json({ error: "Không tìm thấy nhà thuốc." });
            return;
        }

        // Kiểm tra email mới có bị trùng không
        if (email && email !== pharmacy.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({ error: "Email đã được sử dụng." });
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
        res.status(200).json({ message: "Cập nhật nhà thuốc thành công.", pharmacy });
    } catch (error) {
        console.error("Error updating pharmacy:", error);
        res.status(500).json({ error: "Lỗi khi cập nhật nhà thuốc." });
    }
};

export const deletePharmacy = async (req: Request, res: Response): Promise<void> => {
    try {
        const pharmacyId = req.params.pharmacyId;
        const deletedPharmacy = await Pharmacy.findByIdAndDelete(pharmacyId);

        if (!deletedPharmacy) {
            res.status(404).json({ error: "Không tìm thấy nhà thuốc." });
            return;
        }

        res.status(200).json({ message: "Xóa nhà thuốc thành công." });
    } catch (error) {
        console.error("Error deleting pharmacy:", error);
        res.status(500).json({ error: "Lỗi khi xóa nhà thuốc." });
    }
};
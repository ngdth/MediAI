import { Request, Response, RequestHandler } from "express";
import Joi from "joi";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User";
import { sendEmail } from "../../config/email";
import { normalizeEmail } from "../../utils/normalizeEmail";
import { generateVerificationCode } from "../../utils/generateToken";

const TEMP_CODE_STORAGE: Map<string, string> = new Map();

// Base schemas for reusable fields
const baseSchemas = {
    email: Joi.string()
        .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        .allow("")
        .messages({
            "string.pattern.base": "Vui lòng nhập địa chỉ email hợp lệ.",
        }),
    username: Joi.string()
        .pattern(/^[a-zA-Z\s\u00C0-\u1EF9]{2,50}$/)
        .allow("")
        .messages({
            "string.pattern.base": "Tên người dùng chỉ được chứa chữ cái và khoảng trắng",
        }),
    password: Joi.string()
        .pattern(/^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=\[\]{}|;:,.<>?]{6,24}$/)
        .messages({
            "string.empty": "Mật khẩu là bắt buộc.",
            "string.pattern.base":
                "Mật khẩu phải từ 6-24 ký tự, bao gồm chữ cái, số, ít nhất một chữ cái in hoa.",
        }),
    phone: Joi.string()
        .pattern(/^(\+84|0)(3|5|7|8|9)[0-9]{8}$/)
        .allow("")
        .messages({
            "string.pattern.base": "Vui lòng nhập số điện thoại hợp lệ.",
        }),
    gender: Joi.string()
        .valid("Nam", "Nữ", "")
        .messages({
            "any.only": "Giới tính phải là 'Nam' hoặc 'Nữ'.",
        }),
    code: Joi.string()
        .pattern(/^\d{6}$/)
        .messages({
            "string.empty": "Mã xác thực là bắt buộc.",
            "string.pattern.base": "Mã xác thực phải là 6 chữ số.",
        }),
    birthday: Joi.date()
        .allow(null)
        .messages({
            "date.base": "Ngày sinh phải là ngày hợp lệ.",
        }),
    address: Joi.string()
        .max(100)
        .allow("")
        .messages({
            "string.max": "Địa chỉ không được vượt quá 100 ký tự.",
        }),
    city: Joi.string()
        .max(50)
        .allow("")
        .messages({
            "string.max": "Thành phố không được vượt quá 50 ký tự.",
        }),
    country: Joi.string()
        .max(50)
        .allow("")
        .messages({
            "string.max": "Quốc gia không được vượt quá 50 ký tự.",
        }),
    bio: Joi.string()
        .max(1000)
        .allow("")
        .messages({
            "string.max": "Tiểu sử không được vượt quá 1000 ký tự.",
        }),
};

// Endpoint-specific schemas
const userSchema = Joi.object({
    email: baseSchemas.email.required(),
    username: baseSchemas.username.required(),
    password: baseSchemas.password.required(),
    phone: baseSchemas.phone,
    gender: baseSchemas.gender.required(),
});

const verifySchema = Joi.object({
    email: baseSchemas.email.required(),
    code: baseSchemas.code.required(),
});

const otpSchema = Joi.object({
    email: baseSchemas.email.required(),
});

const forgotPasswordSchema = Joi.object({
    email: baseSchemas.email.required(),
    code: baseSchemas.code.required(),
    newPassword: baseSchemas.password.required(),
});

const deleteUnverifiedSchema = Joi.object({
    email: baseSchemas.email.required(),
});

const changePasswordSchema = Joi.object({
    oldPassword: baseSchemas.password.required(),
    newPassword: baseSchemas.password.required(),
    confPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
            "string.empty": "Xác nhận mật khẩu là bắt buộc.",
            "any.only": "Xác nhận mật khẩu phải trùng với mật khẩu mới.",
        }),
});

const updateProfileSchema = Joi.object({
    username: baseSchemas.username,
    email: baseSchemas.email,
    birthday: baseSchemas.birthday,
    gender: baseSchemas.gender,
    phone: baseSchemas.phone,
    address: baseSchemas.address,
    city: baseSchemas.city,
    country: baseSchemas.country,
    bio: baseSchemas.bio,
});

// Hàm đăng ký người dùng
export const registerUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { email, username, password, phone, gender } = req.body;

    // Validate dữ liệu đầu vào
    const { error } = userSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        res.status(400).json({ message: errorMessage });
        return;
    }

    try {
        const normalizedEmail = normalizeEmail(email);

        // Check email already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            res.status(400).json({ message: "Email đã tồn tại" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationCode = generateVerificationCode();
        TEMP_CODE_STORAGE.set(normalizedEmail, verificationCode);

        const newUser = new User({
            email: normalizedEmail,
            username: username.trim(),
            password: hashedPassword,
            role: "user",
            phone: phone || undefined,
            gender,
            verified: false,
        });

        await newUser.save();

        // Send verification email
        try {
            await sendEmail(normalizedEmail, { code: verificationCode }, "register");
            res.status(201).json({
                message: "Đăng ký người dùng thành công. Mã xác thực đã được gửi đến email của bạn.",
                user: {
                    email: newUser.email,
                    username: newUser.username,
                    role: newUser.role,
                },
            });
        } catch (emailError) {
            console.error("Lỗi khi gửi email xác thực:", emailError);
            res.status(500).json({ message: "Không thể gửi email xác thực" });
            return;
        }
    } catch (error) {
        console.error("Lỗi khi đăng ký người dùng:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

// Hàm đăng nhập người dùng
export const loginUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const normalizedEmail = normalizeEmail(email);

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }

        if (!user.active) {
            res.status(403).json({ message: "Tài khoản của bạn đã bị khóa" });
            return;
        }

        if (!user.password) {
            res.status(500).json({ message: "Mật khẩu của người dùng này bị thiếu." });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Mật khẩu sai" });
            return;
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: "4h" }
        );

        res.status(200).json({
            message: "Đăng nhập thành công",
            token,
            user: {
                email: user.email,
                username: user.username,
                role: user.role,
                verified: user.verified,
            },
        });
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

// Hàm xác thực tài khoản
export const verifyAccount: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { email, code } = req.body;

    // Validate dữ liệu đầu vào
    const { error } = verifySchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        res.status(400).json({ message: errorMessage });
        return;
    }

    try {
        const normalizedEmail = normalizeEmail(email);

        const storedCode = TEMP_CODE_STORAGE.get(normalizedEmail);
        if (!storedCode || storedCode !== code) {
            res.status(400).json({ message: "Mã xác thực không hợp lệ hoặc đã hết hạn" });
            return;
        }

        TEMP_CODE_STORAGE.delete(normalizedEmail);

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }

        user.verified = true;
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );
        res.status(200).json({ message: "Xác thực thành công", token });
    } catch (error) {
        console.error("Lỗi khi xác thực:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

// Hàm gửi OTP
export const sendOTP: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    // Validate dữ liệu đầu vào
    const { error } = otpSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        res.status(400).json({ message: errorMessage });
        return;
    }

    try {
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy email" });
            return;
        }

        const verificationCode = generateVerificationCode();
        TEMP_CODE_STORAGE.set(normalizedEmail, verificationCode);

        await sendEmail(normalizedEmail, { code: `Mã OTP của bạn là ${verificationCode}` }, "register");
        res.status(200).json({ message: "OTP đã được gửi đến email" });
    } catch (error) {
        console.error("Lỗi khi gửi OTP:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

// Hàm quên mật khẩu
export const forgotPassword: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { email, code, newPassword } = req.body;

    // Validate dữ liệu đầu vào
    const { error } = forgotPasswordSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        res.status(400).json({ message: errorMessage });
        return;
    }

    try {
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            res.status(400).json({ message: "Không tìm thấy người dùng" });
            return;
        }

        if (TEMP_CODE_STORAGE.get(normalizedEmail) !== code) {
            res.status(400).json({ message: "Mã xác thực không hợp lệ" });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        TEMP_CODE_STORAGE.delete(normalizedEmail);
        await user.save();

        res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
    } catch (error) {
        console.error("Lỗi khi đặt lại mật khẩu:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

// Hàm xóa tài khoản chưa xác thực
export const deleteUnverifiedAcc: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    // Validate dữ liệu đầu vào
    const { error } = deleteUnverifiedSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        res.status(400).json({ message: errorMessage });
        return;
    }

    try {
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }

        if (user.verified) {
            res.status(400).json({ message: "Không thể xóa người dùng đã xác thực" });
            return;
        }

        await User.deleteOne({ email: normalizedEmail });

        res.status(200).json({ message: "Xóa người dùng chưa xác thực thành công" });
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        res.status(500).json({ message: "Lỗi khi xóa người dùng" });
    }
};

// Hàm đổi mật khẩu
export const changePassword: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { oldPassword, newPassword, confPassword } = req.body;

    // Validate dữ liệu đầu vào
    const { error } = changePasswordSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        res.status(400).json({ message: errorMessage });
        return;
    }

    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }

        if (!user.password) {
            res.status(500).json({ message: "Mật khẩu của người dùng này bị thiếu." });
            return;
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Mật khẩu cũ không đúng" });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save({ validateModifiedOnly: true });

        res.status(200).json({ message: "Thay đổi mật khẩu thành công" });
    } catch (error) {
        console.error("Lỗi khi thay đổi mật khẩu:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

// Hàm cập nhật hồ sơ
export const updateProfile: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { username, email, birthday, gender, phone, address, city, country, bio } = req.body;

    // Validate dữ liệu đầu vào
    const { error } = updateProfileSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ");
        res.status(400).json({ message: errorMessage });
        return;
    }

    try {
        const userId = req.user.id; // Lấy user id từ request
        const updateData = {
            ...(username && { username }),
            ...(email && { email }),
            ...(birthday !== undefined && { birthday }),
            ...(gender && { gender }),
            ...(phone && { phone }),
            ...(address && { address }),
            ...(city && { city }),
            ...(country && { country }),
            ...(bio && { bio }),
        };

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }

        res.status(200).json({ user: updatedUser });
    } catch (error) {
        console.error("Lỗi khi cập nhật hồ sơ người dùng:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

// Hàm cập nhật avatar
export const updateAvatar: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "Không có file nào được tải lên." });
            return;
        }

        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng." });
            return;
        }

        // Delete the physical file
        const uploadsDir = path.join(__dirname, process.env.UPLOADS_DIR_AVATARS || "../../../../client/public");

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
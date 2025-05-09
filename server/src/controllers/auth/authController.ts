import { Request, Response, RequestHandler } from "express";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User";
import { sendEmail } from "../../config/email";
import { normalizeEmail } from "../../utils/normalizeEmail";
import { generateVerificationCode } from "../../utils/generateToken";
import {
    validateEmail,
    validateUsername,
    validatePassword,
    validatePhone,
    validateGender,
    validateCode,
    validateBirthday,
    validateAddress,
    validateCity,
    validateCountry,
    validateBio,
    validateConfPassword,
    validateFields,
} from "../../utils/validate";
import { v4 as uuidv4 } from "uuid";
import streamifier from "streamifier";
import bucket from "../../config/firebase";

const TEMP_CODE_STORAGE: Map<string, string> = new Map();

// Hàm đăng ký người dùng
export const registerUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { email, username, password, phone, gender } = req.body;

    // Kiểm tra các trường bắt buộc
    const errors: string[] = [];
    if (!email) errors.push("Email không được trống.");
    if (!username) errors.push("Tên người dùng không được trống.");
    if (!password) errors.push("Mật khẩu không được trống.");
    if (!gender) errors.push("Giới tính không được trống.");

    // Validate định dạng các trường
    const validationErrors = validateFields({
        email: { value: email, validator: validateEmail },
        username: { value: username, validator: validateUsername },
        password: { value: password, validator: validatePassword },
        phone: { value: phone, validator: validatePhone },
        gender: { value: gender, validator: validateGender },
    });

    errors.push(...validationErrors);

    if (errors.length > 0) {
        const errorMessage = errors.join(" ");
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

    // Kiểm tra các trường bắt buộc
    const errors: string[] = [];
    if (!email || !password) errors.push("Email và mật khẩu không được trống.");

    // Validate định dạng các trường
    const validationErrors = validateFields({
        email: { value: email, validator: validateEmail },
    });

    errors.push(...validationErrors);

    if (errors.length > 0) {
        const errorMessage = errors.join(" ");
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

        if (!user.active) {
            res.status(403).json({ message: "Tài khoản của bạn đã bị khóa" });
            return;
        }

        if (!user.password) {
            res.status(500).json({ message: "Tài khoản này không có mật khẩu" });
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

    // Kiểm tra các trường bắt buộc
    const errors: string[] = [];
    if (!email) errors.push("Email không được trống.");
    if (!code) errors.push("Mã xác thực không được trống.");

    // Validate định dạng các trường
    const validationErrors = validateFields({
        email: { value: email, validator: validateEmail },
        code: { value: code, validator: validateCode },
    });

    errors.push(...validationErrors);

    if (errors.length > 0) {
        const errorMessage = errors.join(" ");
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
            { expiresIn: "4h" }
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

    // Kiểm tra các trường bắt buộc
    const errors: string[] = [];
    if (!email) errors.push("Email không được trống.");

    // Validate định dạng các trường
    const validationErrors = validateFields({
        email: { value: email, validator: validateEmail },
    });

    errors.push(...validationErrors);

    if (errors.length > 0) {
        const errorMessage = errors.join(" ");
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

    // Kiểm tra các trường bắt buộc
    const errors: string[] = [];
    if (!email) errors.push("Email không được trống.");
    if (!code) errors.push("Mã xác thực không được trống.");
    if (!newPassword) errors.push("Mật khẩu mới không được trống.");

    // Validate định dạng các trường
    const validationErrors = validateFields({
        email: { value: email, validator: validateEmail },
        code: { value: code, validator: validateCode },
        newPassword: { value: newPassword, validator: validatePassword },
    });

    errors.push(...validationErrors);

    if (errors.length > 0) {
        const errorMessage = errors.join(" ");
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

    // Kiểm tra các trường bắt buộc
    const errors: string[] = [];
    if (!email) errors.push("Email không được trống.");

    // Validate định dạng các trường
    const validationErrors = validateFields({
        email: { value: email, validator: validateEmail },
    });

    errors.push(...validationErrors);

    if (errors.length > 0) {
        const errorMessage = errors.join(" ");
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

    // Kiểm tra các trường bắt buộc
    const errors: string[] = [];
    if (!oldPassword) errors.push("Mật khẩu cũ không được trống.");
    if (!newPassword) errors.push("Mật khẩu mới không được trống.");
    if (!confPassword) errors.push("Xác nhận mật khẩu không được trống.");

    // Validate định dạng các trường
    const validationErrors = validateFields({
        oldPassword: { value: oldPassword, validator: validatePassword },
        newPassword: { value: newPassword, validator: validatePassword },
        confPassword: {
            value: confPassword,
            validator: (value: string | undefined) => validateConfPassword(newPassword, value),
        },
    });

    errors.push(...validationErrors);

    if (errors.length > 0) {
        const errorMessage = errors.join(" ");
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

    // Không có trường bắt buộc, tất cả đều tùy chọn
    const errors: string[] = [];

    // Validate định dạng các trường
    const validationErrors = validateFields({
        username: { value: username, validator: validateUsername },
        email: { value: email, validator: validateEmail },
        birthday: { value: birthday, validator: validateBirthday },
        gender: { value: gender, validator: validateGender },
        phone: { value: phone, validator: validatePhone },
        address: { value: address, validator: validateAddress },
        city: { value: city, validator: validateCity },
        country: { value: country, validator: validateCountry },
        bio: { value: bio, validator: validateBio },
    });

    errors.push(...validationErrors);

    if (errors.length > 0) {
        const errorMessage = errors.join(" ");
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
        if (!req.file || !req.file.buffer) {
            res.status(400).json({ message: "Không có file nào được tải lên." });
            return;
        }

        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng." });
            return;
        }

        // Nếu user đã có avatar cũ (từng là URL Firebase), ta không cần xóa file vật lý cục bộ nữa
        // Nhưng nếu trước đó dùng local và còn giữ đường dẫn cũ, bạn có thể xử lý:
        if (user.imageUrl && user.imageUrl.startsWith("/uploads/avatars/")) {
            const uploadsDir = path.join(__dirname, process.env.UPLOADS_DIR_AVATARS || "../../../../client/public");
            const oldAvatarPath = path.join(uploadsDir, user.imageUrl);
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }

        // Upload file mới lên Firebase
        const fileName = `avatars/${uuidv4()}-${req.file.originalname}`;
        const file = bucket.file(fileName);

        const stream = file.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        stream.on("error", (err: any) => {
            console.error("🟥 Firebase upload error:", err.message);
            res.status(500).json({ message: "Lỗi upload Firebase", error: err.message });
        });

        stream.on("finish", async () => {
            await file.makePublic(); // Cho phép public ảnh
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
            user.imageUrl = publicUrl;
            await user.save();
            res.json({ imageUrl: publicUrl });
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
    } catch (error: any) {
        console.error("🟥 Lỗi khi cập nhật avatar:", error.message);
        res.status(500).json({ message: "Có lỗi xảy ra khi cập nhật avatar", error: error.message });
    }
};
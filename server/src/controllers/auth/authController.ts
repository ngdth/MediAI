import { Request, Response, RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User";
import { sendEmail  } from "../../config/email";
import { normalizeEmail } from "../../utils/normalizeEmail";
import { generateVerificationCode } from "../../utils/generateToken";

const TEMP_CODE_STORAGE: Map<string, string> = new Map();


export const registerUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { email, username, password, phone, gender } = req.body;

    try {
        const normalizedEmail = normalizeEmail(email);

        // Check email and username already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            res.status(400).json({ message: "Email already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationCode = generateVerificationCode();
        TEMP_CODE_STORAGE.set(normalizedEmail, verificationCode);

        try {
            await sendEmail(normalizedEmail, { code: verificationCode }, "register");
        } catch (emailError) {
            console.error("Error sending verification email:", emailError);
            res.status(500).json({ message: "Failed to send verification email" });
            return;
        }

        const newUser = new User({
            email: normalizedEmail,
            username: username.trim(),
            password: hashedPassword,
            role: "user",
            phone: phone,
            gender: gender,
            verified: false,
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully. Verification code sent to your email.",
            user: {
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Login user
export const loginUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const normalizedEmail = normalizeEmail(email);

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // if (!user.verified) {
        //     res.status(403).json({ message: "Email not verified. Please verify your email before logging in." });
        //     return;
        // }

        if (!user.password) {
            res.status(500).json({ message: "Password is missing for this user." });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Wrong password" });
            return;
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: "4h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                email: user.email,
                username: user.username,
                role: user.role,
                verified: user.verified,
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// Verify account
export const verifyAccount: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { email, code } = req.body;

    if (!email || !code) {
        res.status(400).json({ message: "Email and code are required" });
        return;
    }

    try {
        const normalizedEmail = normalizeEmail(email);

        const storedCode = TEMP_CODE_STORAGE.get(normalizedEmail);
        if (!storedCode || storedCode !== code) {
            res.status(400).json({ message: "Invalid or expired verification code" });
            return;
        }

        TEMP_CODE_STORAGE.delete(normalizedEmail);

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        user.verified = true;
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );
        console.log("JWT_SECRET:", process.env.JWT_SECRET);
        res.status(200).json({ message: "Verification successful", token });
    } catch (error) {
        console.error("Error during verification:", error);
        res.status(500).json({ message: "Server error" });
    }
};


export const sendOTP: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404).json({ message: 'Email not found' });
        return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    TEMP_CODE_STORAGE.set(email, otp.toString());

    await sendEmail(email, {code: `Your OTP is ${otp}`}, "register");
    res.status(200).json({ message: 'OTP sent to email' });
};


export const forgotPassword: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        if (TEMP_CODE_STORAGE.get(email) !== code) {
            res.status(400).json({ message: "Invalid code" });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        TEMP_CODE_STORAGE.delete(email);
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};

//delete Unverified Account - dùng trong lúc đăng kí tài khoản nhưng sai mail và trở về đăng ký lại
export const deleteUnverifiedAcc = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ message: "Email are required" });
        return;
    }

    try {
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (user.verified) {
            res.status(400).json({ message: "Cannot delete verified user" });
            return;
        }

        await User.deleteOne({ email });

        res.status(200).json({ message: "Unverified user deleted" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Error deleting user", error });
    }
};

//Change pasword
export const changePassword: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { oldPassword, newPassword, confPassword  } = req.body;

        if (!oldPassword || !newPassword || !confPassword) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        if (newPassword !== confPassword) {
            res.status(400).json({ message: "New password and confirm password do not match" });
            return;
        }

        const userId = req.params.id;
        const user = await User.findById(userId); 
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (!user.password) {
            res.status(500).json({ message: "Password is missing for this user." });
            return;
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Wrong password" });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save({ validateModifiedOnly: true });

        res.status(200).json({ message: "Password change successful" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};
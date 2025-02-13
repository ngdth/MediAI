import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendVerificationEmail = async (email: string, code: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        logger: true,
        debug: true,
    });

    const mailOptions = {
        from: `"AMMA" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verification Code",
        text: `Your verification code is: ${code}`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send verification email");
    }
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);
};

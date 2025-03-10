import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (email: string, data: any, type: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        logger: true,
        debug: true,
    });

    let mailOptions;

    switch (type) {
        case "register":
            mailOptions = {
                from: `"AMMA" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Verification Code",
                text: `Your verification code is: ${data.code}`,
            };
            break;

        case "appointment":
            mailOptions = {
                from: `"AMMA" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Xác nhận đặt lịch hẹn thành công",
                html: `
                    <h2 style="color: #008080;">Xác nhận đặt lịch hẹn thành công</h2>
                    <p>Thưa Quý khách,</p>
                    <p>Xin cảm ơn Quý khách đã tin tưởng và lựa chọn dịch vụ của chúng tôi.</p>
                    <p>Chúng tôi đã nhận được yêu cầu đặt lịch hẹn và sẽ sớm liên hệ với Quý khách để xác nhận lịch hẹn.</p>
                    <p style="font-weight: bold; color: red;">Lưu ý: Lịch khám CHƯA ĐƯỢC XÁC NHẬN cho đến khi tổng đài liên hệ với Quý khách.</p>
                    <p><strong>Chi tiết lịch hẹn:</strong></p>
                    <ul>
                        <li><strong>Bệnh nhân:</strong> ${data.patientName}</li>
                        <li><strong>Ngày:</strong> ${new Date(data.date).toLocaleDateString('vi-VN')}</li>
                        <li><strong>Giờ:</strong> ${data.time}</li>
                        <li><strong>Triệu chứng:</strong> ${data.symptoms}</li>
                    </ul>
                    <p>Nếu cần thay đổi lịch hẹn, vui lòng liên hệ hotline: <strong>0236 3650 676</strong></p>
                    <p>Rất mong được đón tiếp Quý khách.</p>
                    <p><strong>Phòng khám Y Khoa AMMA</strong></p>
                `,
            };
            break;

        default:
            throw new Error("Invalid email type");
    }

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

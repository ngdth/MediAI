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
                subject: "Mã xác minh",
                text: `Mã xác minh của bạn là: ${data.code}`,
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
                    <p>Nếu cần thay đổi lịch hẹn, vui lòng liên hệ hotline: <strong>0967 392 294</strong></p>
                    <p>Rất mong được đón tiếp Quý khách.</p>
                    <p><strong>Phòng khám Y Khoa AMMA</strong></p>
                `,
            };
            break;

        case "appointment_assigned":
            mailOptions = {
                from: `"AMMA" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Lịch hẹn của bạn đã được xác nhận",
                html: `
                        <h2 style="color: #008080;">Lịch hẹn của bạn đã được xác nhận</h2>
                        <p>Thưa Quý khách,</p>
                        <p>Chúng tôi xin thông báo lịch hẹn của quý khách đã được xác nhận và được thực hiện bởi bác sĩ <strong>${data.doctorName}</strong>.</p>
                        <p><strong>Chi tiết lịch hẹn:</strong></p>
                        <ul>
                            <li><strong>Bệnh nhân:</strong> ${data.patientName}</li>
                            <li><strong>Bác sĩ phụ trách:</strong> ${data.doctorName}</li>
                            <li><strong>Ngày:</strong> ${new Date(data.date).toLocaleDateString('vi-VN')}</li>
                            <li><strong>Giờ:</strong> ${data.time}</li>
                            <li><strong>Địa điểm:</strong> Phòng khám Y Khoa AMMA</li>
                        </ul>
                        <p>Nếu cần thay đổi lịch hẹn, vui lòng liên hệ hotline: <strong>0967 392 294</strong></p>
                        <p>Rất mong được đón tiếp Quý khách.</p>
                        <p><strong>Phòng khám Y Khoa AMMA</strong></p>
                    `,
            };
            break;

        case "appointment_rejected":
            mailOptions = {
                from: `"AMMA" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Lịch hẹn của bạn đã bị từ chối",
                html: `
                        <h2 style="color: red;">Lịch hẹn của bạn đã bị từ chối</h2>
                        <p>Xin chào ${data.patientName},</p>
                        <p>Chúng tôi rất tiếc phải thông báo rằng lịch hẹn của bạn vào ngày <strong>${new Date(data.date).toLocaleDateString('vi-VN')}</strong> lúc <strong>${data.time}</strong> đã bị từ chối.</p>
                        <p><strong>Lý do từ chối:</strong> ${data.rejectReason}</p>
                        <p>Nếu bạn cần hỗ trợ hoặc muốn đặt lại lịch hẹn, vui lòng liên hệ chúng tôi qua hotline: <strong>0967 392 294</strong>.</p>
                        <p>Chúng tôi xin lỗi vì sự bất tiện này.</p>
                        <p><strong>Phòng khám Y Khoa AMMA</strong></p>
                    `,
            };
            break;

        case "create_bill":
            mailOptions = {
                from: `"AMMA" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Hóa Đơn Khám Bệnh - ${data.billId}`,
                html: `
                        <h2>Hóa Đơn Khám Bệnh</h2>
                        <p>Xin chào ${data.patientName},</p>
                        <p>Bạn đã đặt lịch khám với bác sĩ <strong>${data.doctorName}</strong></p>
                        <p><strong>Phí dịch vụ:</strong> ${data.testFees.map((t: any) => `${t.name}: ${t.price} VNĐ`).join(", ")}</p>
                        <p><strong>Phí thuốc:</strong> ${data.medicineFees.map((m: any) => `${m.name}: ${m.totalPrice} VNĐ`).join(", ")}</p>
                        <p><strong>Phí bổ sung:</strong> ${data.additionalFees} VNĐ</p>
                        <p><strong>Tổng tiền:</strong> ${data.totalAmount} VNĐ</p>
                        <p><strong>Phương thức thanh toán:</strong> ${data.paymentMethod}</p>
                        <p>Trân trọng,</p>
                        <p><strong>Phòng khám Y Khoa AMMA</strong></p>
                    `,
            };
            break;

        case "payment_success":
            mailOptions = {
                from: `"AMMA" <${process.env.EMAIL_USER}>`,
                to: email,
                subject:
                    `Thanh toán thành công hóa đơn khám bệnh - ${data.billId}`,
                html: `
                    <h2>Thanh toán thanh công</h2>
                    <p>Xin chào ${data.patientName},</p>
                    <p>Bạn đã thanh toán thành công hóa đơn khám bệnh với mã hóa đơn: <strong>${data.billId}</strong>.</p>
                    <p><strong>Phí khám:</strong> ${data.totalAmount} VNĐ</p>`
            };
            break;

        case "contact":
            mailOptions = {
                from: `"AMMA" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Liên hệ từ người dùng: ${data.name}`,
                html: `
            <h2>Yêu cầu liên hệ từ người dùng</h2>
            <p><strong>Họ tên:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Số điện thoại:</strong> ${data.phone}</p>
            <p><strong>Chủ đề:</strong> ${data.subject}</p>
            <p><strong>Nội dung:</strong><br/>${data.message}</p>
        `
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

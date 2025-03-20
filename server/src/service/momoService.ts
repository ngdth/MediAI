import axios from 'axios';
import crypto from 'crypto';
import { Request, Response } from 'express';
import Bill from '../models/Bill';  // Đảm bảo bạn đã import đúng model Bill
import Appointment from '../models/Appointment';
import { sendEmail } from '../config/email';

const accessKey = 'F8BBA842ECF85';
const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
interface MomoResponse {
    resultCode: number;
    message: string;
    payUrl?: string;
    orderId?: string;
    requestId?: string;
}

// 🚀 Hàm tạo thanh toán
export const createPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { billId } = req.body;

        // 🔍 Kiểm tra `billId` hợp lệ
        if (!billId) {
            console.log("⚠️ Thiếu billId trong request!");
            res.status(400).json({ message: "billId is required" });
            return;
        }

        // 📌 Tìm hóa đơn dựa trên `billId`
        const bill = await Bill.findOne({ billId });

        if (!bill) {
            console.log("❌ Không tìm thấy hóa đơn với billId:", billId);
            res.status(404).json({ message: "Bill not found for this billId." });
            return;
        }

        const amount = bill.totalAmount; // Lấy tổng số tiền từ hóa đơn
        const orderInfo = 'Thanh toán qua MoMo';
        const partnerCode = 'MOMO';
        const redirectUrl = 'http://localhost:3000/success';  // URL thành công (có thể thay đổi)
        const ipnUrl = 'https://bf6d-123-19-56-67.ngrok-free.app/callback';  // Cập nhật lại ngrok nếu cần
        const requestType = "payWithMethod";
        const orderId = `${partnerCode}_${billId}_${Date.now()}`;
        const requestId = orderId;
        const extraData = '';
        const autoCapture = true;
        const lang = 'vi';

        // 🔒 Tạo chữ ký HMAC SHA256
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        // 📩 Chuẩn bị request gửi tới MoMo
        const requestBody = {
            partnerCode,
            partnerName: "Test",
            storeId: "MomoTestStore",
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            lang,
            requestType,
            autoCapture,
            extraData,
            signature
        };

        console.log("🚀 Sending payment request to MoMo:", requestBody);

        // 📡 Gửi yêu cầu đến MoMo API (Sử dụng Generic `<MomoResponse>` để ép kiểu)
        const response = await axios.post<MomoResponse>('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
            headers: { 'Content-Type': 'application/json' }
        });

        const responseData: MomoResponse = response.data; // Ép kiểu chính xác

        console.log("✅ MoMo response:", responseData);

        // Nếu tạo thanh toán thành công, trả về `payUrl`
        if (responseData.resultCode === 0) {
            res.status(200).json({
                message: "Payment created successfully",
                payUrl: responseData.payUrl, // URL để khách hàng thanh toán MoMo
                orderId: responseData.orderId,
                requestId: responseData.requestId,
                resultCode: responseData.resultCode
            });
        } else {
            console.log("❌ Lỗi khi tạo thanh toán MoMo:", responseData);
            res.status(400).json({
                message: "Failed to create payment",
                error: responseData.message
            });
        }
    } catch (error: any) {
        console.error("❌ Lỗi khi gọi API MoMo:", error?.response?.data || error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


// Hàm xử lý callback từ MoMo
export const paymentCallback = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("🔥 Callback received from MoMo:", req.body);
        if (!req.body || typeof req.body !== 'object') {
            console.log("❌ Invalid request body");
            res.status(400).json({ message: "Invalid request body" });
            return;
        }

        const { resultCode, billId, message, transId } = req.body;

        if (!resultCode || !billId) {
            console.log("⚠️ Thiếu `resultCode` hoặc `billId` trong callback:", req.body);
            res.status(400).json({
                message: "Thiếu dữ liệu từ MoMo callback",
                resultCode: resultCode || null,
                billId: billId || null
            });
            return;
        }

        if (Number(resultCode) === 0) {  // ✅ Thanh toán thành công
            console.log("✅ Payment successful for Bill ID:", billId);

            // 📌 Cập nhật trạng thái thanh toán của Bill
            const updatedBill = await Bill.findOneAndUpdate(
                { billId },
                { paymentStatus: "Completed", transId },
                { new: true }
            );

            if (!updatedBill) {
                console.log("❌ Không tìm thấy hóa đơn với billId:", billId);
                res.status(404).json({ message: "Bill not found" });
                return;
            }

            console.log("✅ Bill updated successfully:", updatedBill);

            // 📌 Tìm thông tin lịch hẹn (Appointment) liên quan
            const appointment = await Appointment.findById(updatedBill.appointmentId)
                .populate("userId", "email");

            if (!appointment || !appointment.userId) {
                console.error("❌ Không tìm thấy thông tin bệnh nhân!");
                res.status(500).json({ message: "Patient not found" });
                return;
            }

            // 📩 Gửi email thông báo cho bệnh nhân
            const user = appointment.userId as { email?: string };
            const userEmail = user.email;
            if (!userEmail) {
                console.error("❌ Không tìm thấy email bệnh nhân!");
                res.status(500).json({ message: "Patient email not found" });
                return;
            }

            console.log("✅ Patient Email Found:", userEmail);

            await sendEmail(userEmail, updatedBill, "payment_success");
            console.log("📩 Email sent to:", userEmail);

            // ✅ Trả về phản hồi thành công
            res.status(200).json({
                message: "Payment processed successfully",
                billId: updatedBill.billId,
                paymentStatus: updatedBill.paymentStatus
            });
            return;
        }

        // ❌ Nếu thanh toán thất bại
        console.log("❌ Payment failed. Result Code:", resultCode);
        res.status(400).json({ message: "Payment failed", resultCode });
        return;

    } catch (error) {
        console.error("❌ Error in payment callback:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

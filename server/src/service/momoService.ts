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
        const { _id } = req.body;

        // 🔍 Kiểm tra `_id` hợp lệ
        if (!_id) {
            console.log("Thiếu _id trong request!");
            res.status(400).json({ message: "_id is required" });
            return;
        }

        // Tìm hóa đơn dựa trên `_id`
        const bill = await Bill.findById(_id);

        if (!bill) {
            console.log("Không tìm thấy hóa đơn với _id:", _id);
            res.status(404).json({ message: "Bill not found for this _id." });
            return;
        }

        const amount = bill.totalAmount; // Lấy tổng số tiền từ hóa đơn
        const orderInfo = 'Thanh toán qua MoMo';
        const partnerCode = 'MOMO';
        // const redirectUrl = 'http://localhost:5173/payment';  // URL thành công (có thể thay đổi)
        const redirectUrl = req.body.redirectUrl;
        const ipnUrl = 'https://api.amma-care.com/payment/callback';  // Cập nhật lại ngrok nếu cần
        // const requestType = "payWithMethod";
        const requestType = req.body.requestType;
        const orderId = `${partnerCode}_${_id}_${Date.now()}`;
        const requestId = `${_id}`;
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

        console.log("Gửi yêu cầu thanh toán đến MOMO:", requestBody);

        // 📡 Gửi yêu cầu đến MoMo API (Sử dụng Generic `<MomoResponse>` để ép kiểu)
        const response = await axios.post<MomoResponse>('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
            headers: { 'Content-Type': 'application/json' }
        });

        const responseData: MomoResponse = response.data; // Ép kiểu chính xác

        console.log("Phản hồi của MOMO:", responseData);

        // Nếu tạo thanh toán thành công, trả về `payUrl`
        if (responseData.resultCode === 0) {
            res.status(200).json({
                message: "Tạo thanh toán thành công",
                payUrl: responseData.payUrl, // URL để khách hàng thanh toán MoMo
                orderId: responseData.orderId,
                requestId: responseData.requestId,
                resultCode: responseData.resultCode
            });
        } else {
            console.log("Lỗi khi tạo thanh toán MoMo:", responseData);
            res.status(400).json({
                message: "Lỗi khi tạo thanh toán",
                error: responseData.message
            });
        }
    } catch (error: any) {
        console.error("Lỗi khi gọi API MoMo:", error?.response?.data || error.message);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};


// Hàm xử lý callback từ MoMo
export const paymentCallback = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("Callback đã nhận từ MoMo:", req.body);
        if (!req.body || typeof req.body !== 'object') {
            console.log("Request body không hợp lệ");
            res.status(400).json({ message: "Request body không hợp lệ" });
            return;
        }

        const { resultCode, requestId } = req.body;

        // if (!resultCode || !billId) {
        //     console.log("Thiếu `resultCode` hoặc `billId` trong callback:", req.body);
        //     res.status(400).json({
        //         message: "Thiếu dữ liệu từ MoMo callback",
        //         resultCode: resultCode || null,
        //         billId: billId || null
        //     });
        //     return;
        // }

        if ((resultCode) === 0) {  // ✅ Thanh toán thành công
            console.log("Thanh toán thành công cho Bill ID:", requestId);

            // 📌 Cập nhật trạng thái thanh toán của Bill
            const updatedBill = await Bill.findOneAndUpdate(
                { _id: requestId },
                { paymentStatus: "Paid" },
                { new: true }
            );

            if (updatedBill) {
                console.log("Cập nhật bill thành công:", updatedBill);
            } else {
                console.log("Không tìm thấy hóa đơn với billId:", requestId);
                res.status(404).json({ message: "Không tìm thấy bill" });
                return;
            }

            console.log("Cập nhật bill thành công:", updatedBill);

            // 📌 Tìm thông tin lịch hẹn (Appointment) liên quan
            const appointment = await Appointment.findById(updatedBill.appointmentId)
                .populate("userId", "email");

            if (!appointment || !appointment.userId) {
                console.error("Không tìm thấy thông tin bệnh nhân!");
                res.status(500).json({ message: "Không tìm thấy thông tin bệnh nhân" });
                return;
            }

            // 📩 Gửi email thông báo cho bệnh nhân
            const user = appointment.userId as { email?: string };
            const userEmail = user.email;
            if (!userEmail) {
                console.error("Không tìm thấy email bệnh nhân!");
                res.status(500).json({ message: "Không tìm thấy email bệnh nhân" });
                return;
            }

            console.log("Đã tìm thấy email bệnh nhân:", userEmail);

            await sendEmail(userEmail, updatedBill, "payment_success");
            console.log("Đã gửi email đến:", userEmail);

            // Trả về phản hồi thành công
            res.status(200).json({
                billId: updatedBill._id,
                paymentStatus: updatedBill.paymentStatus
            });
            return;
        }

        // Nếu thanh toán thất bại
        console.log(" Thanh toán thất bại. Mã lỗi:", resultCode);
        res.status(400).json({ message: "Thanh toán thất bại", resultCode });
        return;

    } catch (error) {
        console.error("Lỗi khi callback thanh toán:", error);
        res.status(500).json({
            message: "Lỗi máy chủ",
            error: error instanceof Error ? error.message : "Lỗi"
        });
    }
};

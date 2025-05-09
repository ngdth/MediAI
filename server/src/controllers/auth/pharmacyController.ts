import Bill from '../../models/Bill';
import Appointment, { AppointmentStatus } from '../../models/Appointment';
import { Request, Response, NextFunction } from 'express';
import { calculateTotalAmount } from '../../utils/calc';
import { sendEmail } from '../../config/email';
import DiagnosisDetails from '../../models/DiagnosisDetails';
import mongoose from 'mongoose';

// export const getDoneAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     console.log("Starting getDoneAppointments function");
//     try {
//         const pharmacyId = req.user?.id; // Lấy pharmacyId từ token (req.user đã được xác thực)
//         console.log(`Extracted pharmacyId from token: ${pharmacyId}`);

//         if (!pharmacyId) {
//             console.log("Error: Pharmacy ID not found in token");
//             res.status(400).json({ message: "Pharmacy ID not found in token" });
//             return;
//         }

//         console.log(`Searching for appointments with status DONE and pharmacyId: ${pharmacyId}`);
//         // Tìm tất cả các appointment có status "Done" và pharmacyId trùng với tài khoản nhà thuốc đang đăng nhập
//         const appointments = await Appointment.find({
//             status: AppointmentStatus.DONE,
//             pharmacyId: pharmacyId  // Sử dụng pharmacyId từ token
//         })
//             .populate('userId', 'username email')  // Lấy thông tin bệnh nhân
//             .populate('doctorId', 'username email')  // Lấy thông tin bác sĩ
//             .populate('pharmacyId', 'name email');  // Lấy thông tin nhà thuốc

//         console.log(`Found ${appointments.length} done appointments`);

//         if (appointments.length === 0) {
//             console.log("No done appointments found for this pharmacy");
//             res.status(404).json({ message: "No done appointments found for this pharmacy" });
//             return;
//         }

//         console.log("Successfully retrieved done appointments");
//         res.status(200).json({
//             message: "Done appointments retrieved successfully",
//             data: appointments,
//         });
//     } catch (error) {
//         console.error("Error fetching done appointments:", error);
//         res.status(500).json({ message: "Error fetching done appointments", error });
//     }
//     console.log("Completed getDoneAppointments function");
// };
export const getDoneAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id; // Trích xuất ID người dùng từ token (req.user đã được xác thực)
        const userRole = req.user?.role; // Trích xuất vai trò của người dùng (pharmacy hoặc doctor)
        console.log(`Lấy userId từ token: ${userId}`);
        console.log(`Role người dùng: ${userRole}`);

        if (!userId) {
            console.log("Lỗi: Không tìm thấy ID người dùng thông qua token");
            res.status(400).json({ message: "Không tìm thấy ID người dùng thông qua token" });
            return;
        }

        // Xây dựng filter dựa trên vai trò của người dùng
        let filter: Record<string, any> = { status: AppointmentStatus.DONE }; // Chỉ lọc các cuộc hẹn có status "DONE"

        // Nếu là bác sĩ, chỉ tìm các cuộc hẹn có doctorId là userId của bác sĩ
        if (userRole === 'doctor') {
            console.log("User is a doctor, filtering by doctorId");
            filter = { ...filter, doctorId: userId }; // Lọc theo doctorId
        }
        // Nếu là nhà thuốc, tìm các cuộc hẹn có pharmacyId trùng với userId của pharmacy
        else if (userRole === 'pharmacy') {
            console.log("User is a pharmacy, filtering by pharmacyId");
            filter = { ...filter, pharmacyId: userId }; // Lọc theo pharmacyId
        }

        console.log(`Searching for appointments with filter: ${JSON.stringify(filter)}`);

        // Truy vấn cơ sở dữ liệu tìm các cuộc hẹn thỏa mãn filter
        const appointments = await Appointment.find(filter)
            .populate('userId', 'username email')  // Lấy thông tin bệnh nhân
            .populate('doctorId', 'username email')  // Lấy thông tin bác sĩ
            .populate('pharmacyId', 'name email');  // Lấy thông tin nhà thuốc

        console.log(`Found ${appointments.length} done appointments`);

        if (appointments.length === 0) {
            console.log("No done appointments found for this user");
            res.status(404).json({ message: "Không tìm thấy lịch hẹn cho người dùng này" });
            return;
        }

        console.log("Lấy danh sách lịch hẹn đã hoàn thành thành công");

        res.status(200).json({
            message: "Lấy danh sách lịch hẹn đã hoàn thành thành công",
            data: appointments,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách lịch hẹn đã hoàn thành:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách lịch hẹn đã hoàn thành", error });
    }

    console.log("Hoàn thành hàm getDoneAppointments");
};

export const createBill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { appointmentId, testFees, medicineFees, additionalFees, paymentMethod } = req.body;
        console.log('Request body:', req.body);

        // Kiểm tra nếu appointmentId không được cung cấp
        if (!appointmentId) {
            res.status(400).json({ message: "ID lịch hẹn không được trống" });
            return;
        }

        // Lấy thông tin appointment
        const appointment = await Appointment.findById(appointmentId)
            .populate({
                path: 'doctorId',
                select: 'username specialization _id',
                model: 'user'
            })
            .populate({
                path: 'userId',
                select: 'username email _id',
                model: 'user'
            })
            .populate({
                path: 'pharmacyId',
                select: 'name email _id',
                model: 'user'
            });

        console.log('Appointment found:', appointment ? 'Yes' : 'No');
        if (!appointment) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
            return;
        }

        // Log thông tin doctor để debug
        console.log('Doctor info:', appointment.doctorId);
        // Lấy thông tin người dùng
        const user = appointment.userId as { email?: string; _id?: string };
        const userEmail = user?.email;
        const userId = user?._id;

        if (!userEmail || !userId) {
            console.error("Không tìm thấy thông tin bệnh nhân!");
            res.status(500).json({ message: "Không tìm thấy thông tin bệnh nhân" });
            return;
        }
        console.log("Patient info found - Email:", userEmail, "ID:", userId);

        // Kiểm tra paymentMethod hợp lệ
        const validPaymentMethods = ["MOMO", "Cash"];
        if (!validPaymentMethods.includes(paymentMethod)) {
            res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
            return;
        }

        // Tính tổng tiền
        const totalAmount = calculateTotalAmount(testFees, medicineFees, additionalFees);
        console.log("Total amount calculated:", totalAmount);

        let doctorName, doctorSpecialization, doctorId;
        // Lấy thông tin bác sĩ
        const doctors = appointment.doctorId;
        // Kiểm tra xem doctors có phải là mảng không
        if (Array.isArray(doctors) && doctors.length > 0) {
            const doctor = doctors[0] as unknown as { username: string; specialization: string; _id: string };
            doctorName = doctor.username;
            doctorSpecialization = doctor.specialization;
            doctorId = doctor._id;
        } else {
            const doctor = doctors as any;
            doctorName = doctor?.username;
            doctorSpecialization = doctor?.specialization;
            doctorId = doctor?._id;
        }
        console.log("Doctor info extracted:", { doctorName, doctorSpecialization, doctorId });

        // Lấy thông tin nhà thuốc
        const pharmacy = appointment.pharmacyId as { _id?: string };
        const pharmacyId = pharmacy?._id;

        // Tạo hóa đơn mới
        const newBill = new Bill({
            userId: userId,
            doctorId,
            pharmacyId: pharmacyId,
            appointmentId,
            dateIssued: new Date(),
            paymentStatus: 'Unpaid',
            paymentMethod,
            patientName: appointment.patientName,
            patientPhone: appointment?.phone,
            patientEmail: appointment?.email,
            doctorName,
            doctorSpecialization,
            testFees,
            medicineFees,
            additionalFees,
            totalAmount,
            transactionId: null
        });

        console.log("✅ New bill created with data:", {
            userId,
            doctorId,
            pharmacyId,
            appointmentId,
            paymentMethod,
            totalAmount,
            doctorSpecialization
        });

        // Lưu hóa đơn vào DB
        const savedBill = await newBill.save();
        console.log("✅ Bill saved successfully with ID:", savedBill._id);

        // Cập nhật trạng thái Appointment
        await Appointment.findByIdAndUpdate(appointmentId, { status: AppointmentStatus.BILL_CREATED });
        console.log("Appointment status updated to BILL_CREATED");

        res.status(201).json({
            message: "Tạo hóa đơn thành công",
            bill: savedBill,
            billId: savedBill._id
        });

        // Gửi email thông báo
        if (userEmail) {
            await sendEmail(userEmail, newBill, "create_bill");
            console.log("Email sent to patient:", userEmail);
        }
    } catch (error) {
        console.error("Lỗi khi tạo hóa đơn:", error);
        next(error);
    }
};

// get all bills
export const getBills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let bills;
        if (req.user.role === 'doctor') {
            console.log('ID bác sĩ:', req.user._id);
            const appointment = await Appointment.find({ doctorId: req.user._id });
            if (!appointment.length) {
                res.status(404).json({ message: "Không tìm thấy lịch hẹn nào cho bác sĩ này" });
                return;
            }
            const appointmentIds = appointment.map(app => app._id);
            console.log('Lấy danh sách lịch hẹn:', appointmentIds);
            // Lấy hóa đơn dựa trên danh sách appointmentId của bác sĩ
            bills = await Bill.find({ appointmentId: { $in: appointmentIds } });
        }
        else if (req.user.role === 'admin' || req.user.role === 'pharmacy') {
            bills = await Bill.find();
        }
        console.log('Tìm thấy hóa đơn:', bills);
        res.status(200).json({ bills });
    } catch (err) {
        console.log(err);
        next(err)
    }
}

export const getBillsByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user.id;
        if (!userId) {
            res.status(401).json({ message: "Không tìm thấy ID người dùng" });
            return;
        }

        const bills = await Bill.find({ userId })
        .populate({
            path: 'appointmentId',
            select: 'time',
        })
        ;

        if (!bills || bills.length === 0) {
            res.status(404).json({ message: "Không tìm thấy hóa đơn nào" });
            return;
        }

        res.status(200).json({
            message: "Bills retrieved successfully",
            count: bills.length,
            bills
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách hóa đơn:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error });
    }
};

// Lấy chi tiết một hóa đơn cụ thể dựa trên ID và token
export const getBillDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { billId } = req.params;
        const userId = req.user._id || req.user.id;
        const userRole = req.user.role.toLowerCase(); // Chuyển thành chữ thường để so sánh nhất quán

        // Tìm hóa đơn theo ID
        const bill = await Bill.findById(billId)
            .select('-doctorId -doctorName')
            .populate({
                path: 'userId',
                select: 'username email' // Lấy username & email patient
            })
            .populate({
                path: 'appointmentId',
                select: '-services -createdAt -updatedAt -__v -patientName -pharmacyId -status -phone -email',
                populate: {
                    path: 'doctorId',
                    select: 'username email' // Lấy doctorId trong appointment
                }
            });

        if (!bill) {
            console.warn('Không tìm thấy hóa đơn:', billId);
            res.status(404).json({ message: "Không tìm thấy hóa đơn" });
            return;
        }

        // Kiểm tra quyền truy cập
        if (userRole === 'user' && (bill.userId as any)._id.toString() !== userId.toString()) {
            console.warn('Từ chối truy cập cho bệnh nhân:', userId);
            res.status(403).json({ message: "Từ chối truy cập: Bạn chỉ có thể xem hóa đơn của chính bạn" });
            return;
        }

        if (userRole === 'doctor') {
            const appointment = await Appointment.findById(bill.appointmentId);
            if (!appointment || appointment.doctorId.toString() !== userId.toString()) {
                console.warn('Từ chối truy cập cho bác sĩ:', userId);
                res.status(403).json({ message: "Từ chối truy cập: Hóa đơn này không liên quan đến lịch hẹn của bạn" });
                return;
            }
        }

        const diagnosisDetails = await DiagnosisDetails.find({ appointmentId: (bill.appointmentId as any)._id }).populate('doctorId', 'username');
        console.log('Thông tin chẩn đoán:', diagnosisDetails);

        console.log('Tìm thấy hóa đơn:', bill, diagnosisDetails);
        res.status(200).json({ bill, diagnosisDetails });
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error });
    }
};

// update bill ( payment status)
export const updateBill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { billId } = req.params;
        const { paymentStatus, paymentMethod, transactionId } = req.body;

        console.log(`Attempting to update bill with ID: ${billId}`);

        const bill = await Bill.findOne({ billId });
        if (!bill) {
            console.log(`Không tìm thấy hóa đơn với ID: ${billId}`);
            res.status(404).json({ message: "Không tìm thấy hóa đơn" });
            return;
        }

        // Cập nhật các trường thông tin của hóa đơn
        if (paymentStatus) {
            bill.paymentStatus = paymentStatus;
            console.log(`Cập nhật paymentStatus thành: ${paymentStatus}`);
        }
        if (paymentMethod) {
            bill.paymentMethod = paymentMethod;
            console.log(`Cập nhật paymentMethod thành: ${paymentMethod}`);
        }
        if (transactionId) {
            bill.transactionId = transactionId;
            console.log(`Cập nhật transactionId thành: ${transactionId}`);
        }

        // Lưu hóa đơn đã cập nhật vào DB
        await bill.save();
        console.log(`Bill with ID: ${billId} updated successfully`);

        res.status(200).json({ message: "Cập nhật hóa đơn thành công", bill });
    } catch (error) {
        console.error('Lỗi khi cập nhật hóa đơn:', error);
        next(error);
    }
};

// Update medicine prices in a bill
export const updateMedicinesPrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { billId } = req.params;
        const { medicineFees } = req.body;

        console.log(`Attempting to update medicine prices for bill with ID: ${billId}`);

        // Tìm hóa đơn theo _id
        const bill = await Bill.findById(billId);
        if (!bill) {
            console.log(`Bill with ID: ${billId} not found`);
            res.status(404).json({ message: "Không tìm thấy hóa đơn" });
            return;
        }

        // Kiểm tra hóa đơn đang trong quá trình thanh toán hoặc đã thanh toán
        if (bill.paymentStatus === 'Paying' || bill.paymentStatus === 'Paid') {
            const message =
                bill.paymentStatus === 'Paying'
                    ? 'Hóa đơn không thể cập nhật vì đang trong quá trình thanh toán.'
                    : 'Hóa đơn không thể cập nhật vì đã được thanh toán.';
            console.log(`Hóa đơn với ID: ${billId} không thể cập nhật vì trạng thái là ${bill.paymentStatus}`);
            res.status(400).json({ message });
            return;
        }

        // Validate medicineFees
        if (!Array.isArray(medicineFees) || medicineFees.length !== bill.medicineFees.length) {
            console.log(`Mảng medicineFees không hợp lệ`);
            res.status(400).json({ message: "Mảng medicineFees không hợp lệ" });
            return;
        }

        // Validate each medicine entry
        for (let i = 0; i < medicineFees.length; i++) {
            const med = medicineFees[i];
            const originalMed = bill.medicineFees[i];

            if (
                !med.name ||
                !med.unit ||
                !med.quantity ||
                !med.unitPrice ||
                !med.totalPrice ||
                !med.usage ||
                med.name !== originalMed.name ||
                med.unit !== originalMed.unit ||
                med.quantity !== originalMed.quantity ||
                med.usage !== originalMed.usage ||
                med.unitPrice < 0 ||
                med.totalPrice !== med.unitPrice * med.quantity
            ) {
                console.log(`Invalid medicine entry at index ${i}`);
                res.status(400).json({ message: `Thông tin thuốc không hợp lệ tại vị trí ${i}` });
                return;
            }
        }

        // Cập nhật medicineFees
        bill.medicineFees = medicineFees;

        // Tính totalAmount
        bill.totalAmount = calculateTotalAmount(bill.testFees, bill.medicineFees, bill.additionalFees);

        // Lưu hóa đơn đã cập nhật
        await bill.save();
        console.log(`Bill with ID: ${billId} updated successfully`);

        res.status(200).json({ message: "Cập nhật giá thuốc thành công", bill });
    } catch (error) {
        console.error('Error updating medicine prices:', error);
        console.log(`Error details: ${error}`);
        next(error);
    }
};
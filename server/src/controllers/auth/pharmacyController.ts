import Bill from '../../models/Bill';
import Appointment, { AppointmentStatus } from '../../models/Appointment';
import { Request, Response, NextFunction } from 'express';
import { calculateTotalAmount } from '../../utils/calc';
import { sendEmail } from '../../config/email';
import mongoose from 'mongoose';

export const getDoneAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log("Starting getDoneAppointments function");
    try {
        const pharmacyId = req.user?.id; // Lấy pharmacyId từ token (req.user đã được xác thực)
        console.log(`Extracted pharmacyId from token: ${pharmacyId}`);

        if (!pharmacyId) {
            console.log("Error: Pharmacy ID not found in token");
            res.status(400).json({ message: "Pharmacy ID not found in token" });
            return;
        }

        console.log(`Searching for appointments with status DONE and pharmacyId: ${pharmacyId}`);
        // Tìm tất cả các appointment có status "Done" và pharmacyId trùng với tài khoản nhà thuốc đang đăng nhập
        const appointments = await Appointment.find({
            status: AppointmentStatus.DONE,
            pharmacyId: pharmacyId  // Sử dụng pharmacyId từ token
        })
            .populate('userId', 'username email')  // Lấy thông tin bệnh nhân
            .populate('doctorId', 'username email')  // Lấy thông tin bác sĩ
            .populate('pharmacyId', 'name email');  // Lấy thông tin nhà thuốc

        console.log(`Found ${appointments.length} done appointments`);

        if (appointments.length === 0) {
            console.log("No done appointments found for this pharmacy");
            res.status(404).json({ message: "No done appointments found for this pharmacy" });
            return;
        }

        console.log("Successfully retrieved done appointments");
        res.status(200).json({
            message: "Done appointments retrieved successfully",
            data: appointments,
        });
    } catch (error) {
        console.error("Error fetching done appointments:", error);
        res.status(500).json({ message: "Error fetching done appointments", error });
    }
    console.log("Completed getDoneAppointments function");
};

export const createBill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { appointmentId, testFees, medicineFees, additionalFees, paymentMethod } = req.body;

        // Kiểm tra nếu appointmentId không được cung cấp
        if (!appointmentId) {
            res.status(400).json({ message: "Appointment ID is required" });
            return;
        }


        // Lấy thông tin appointment
        // const appointment = await Appointment.findById(appointmentId)
        //     .populate('userId', 'username specialization')
        //     .populate('doctorId', 'username specialization')
        //     .lean();

        const appointment = await Appointment.findById(appointmentId)
            .populate({
                path: 'doctorId',
                select: 'username specialization', // Chỉ lấy 2 trường này
                model: 'user' // Chỉ định model gốc vì dùng discriminator
            })
            .populate({
                path: 'userId',
                select: 'username email',
                model: 'user'
            });

        console.log('Appointment:', appointment);
        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }

        const user = appointment.userId as { email?: string }; // Ensure userId is treated as an object
        const userEmail = user?.email; // Accessing the email from user object
        if (!userEmail) {
            console.error("❌ Không tìm thấy email bệnh nhân!");
            res.status(500).json({ message: "Patient email not found" });
            return;
        }
        console.log("✅ Patient Email Found:", userEmail);
        // Kiểm tra paymentMethod hợp lệ
        const validPaymentMethods = ["MOMO", "Cash"];
        if (!validPaymentMethods.includes(paymentMethod)) {
            res.status(400).json({ message: "Invalid payment method" });
            return;
        }

        // Tính tổng tiền
        const totalAmount = calculateTotalAmount(testFees, medicineFees, additionalFees);


        const doctor = appointment.doctorId as { username?: string; specialization?: string };
        const doctorName = doctor?.username;
        const doctorSpecialization = doctor?.specialization;
        // Tạo hóa đơn mới
        const newBill = new Bill({
            billId: `BILL-${Date.now()}`,
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

        // Lưu hóa đơn vào DB
        await newBill.save();

        // Update Appointment Status
        await Appointment.findByIdAndUpdate(appointmentId, { status: AppointmentStatus.BILL_CREATED });

        if (userEmail) {
            await sendEmail(userEmail, newBill, "create_bill");
        }
        console.log('patient email:', userEmail);
        res.status(201).json({ message: 'Bill created successfully', bill: newBill });
    } catch (error) {
        next(error);
    }
};
// get all bills
export const getBills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let bills;
        if (req.user.role === 'doctor') {
            console.log('Doctor ID:', req.user._id);
            const appointment = await Appointment.find({ doctorId: req.user._id });
            if (!appointment.length) {
                res.status(404).json({ message: "No appointments found for this doctor" });
                return;
            }
            const appointmentIds = appointment.map(app => app._id);
            console.log('Appointments found:', appointmentIds);
            // Lấy hóa đơn dựa trên danh sách appointmentId của bác sĩ
            bills = await Bill.find({ appointmentId: { $in: appointmentIds } });
        }
        else if (req.user.role === 'admin' || req.user.role === 'pharmacy') {
            bills = await Bill.find();
        }
        console.log('Bills found:', bills);
        res.status(200).json({ bills });
    } catch (err) {
        console.log(err);
        next(err)
    }
}
// get bill by id
export const getBillsByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Lấy thông tin user từ token (đã được xác thực qua middleware)
        const userId = req.user._id || req.user.id;
        const userRole = req.user.role;
        console.log(`✅ Extracted userId: ${userId}, userRole: ${userRole}`);
        
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: User ID not found in token" });
            return;
        }

        let bills;

        // Phân quyền truy cập dựa trên vai trò người dùng
        if (userRole === 'user') {
            // Bệnh nhân chỉ xem được hóa đơn của mình
            bills = await Bill.find({ userId: userId });
        } else if (userRole === 'doctor') {
            // Bác sĩ xem được hóa đơn của các cuộc hẹn mà họ phụ trách
            const appointments = await Appointment.find({ doctorId: userId });
            console.log(`✅ Found ${appointments.length} appointments for doctor with ID: ${userId}`);
            if (!appointments.length) {
                res.status(404).json({ message: "No appointments found for this doctor" });
                return;
            }
            const appointmentIds = appointments.map(app => app._id);
            console.log(`✅ Extracted appointment IDs: ${appointmentIds}`);
            bills = await Bill.find({ appointmentId: { $in: appointmentIds } });
        } else if (userRole === 'admin' || userRole === 'pharmacy') {
            // Admin và nhà thuốc có thể xem tất cả hóa đơn
            bills = await Bill.find();
        } else {
            res.status(403).json({ message: "Forbidden: Insufficient permissions" });
            return;
        }

        if (!bills || bills.length === 0) {
            res.status(404).json({ message: "No bills found" });
            return;
        }

        console.log(`Found ${bills.length} bills for user with role ${userRole}`);
        res.status(200).json({ 
            message: "Bills retrieved successfully",
            count: bills.length,
            bills 
        });
    } catch (error) {
        console.error('Error fetching bills:', error);
        res.status(500).json({ message: "Internal server error", error: error });
    }
};

// Lấy chi tiết một hóa đơn cụ thể dựa trên ID và token
export const getBillDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { billId } = req.params;
        const userId = req.user._id || req.user.id;
        const userRole = req.user.role.toLowerCase(); // Chuyển thành chữ thường để so sánh nhất quán

        // Tìm hóa đơn theo ID
        const bill = await Bill.findById(billId);
        
        if (!bill) {
            console.warn('Bill not found:', billId);
            res.status(404).json({ message: 'Bill not found' });
            return;
        }

        // Kiểm tra quyền truy cập
        if (userRole === 'user' && bill.userId.toString() !== userId.toString()) {
            console.warn('Access denied for patient:', userId);
            res.status(403).json({ message: 'Access denied: You can only view your own bills' });
            return;
        }

        if (userRole === 'doctor') {
            const appointment = await Appointment.findById(bill.appointmentId);
            if (!appointment || appointment.doctorId.toString() !== userId.toString()) {
                console.warn('Access denied for doctor:', userId);
                res.status(403).json({ message: 'Access denied: This bill is not associated with your appointments' });
                return;
            }
        }

        console.log('Bill found:', bill);
        res.status(200).json({ bill });
    } catch (error) {
        console.error('Error fetching bill details:', error);
        res.status(500).json({ message: 'Internal server error', error: error });
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
            console.log(`Bill with ID: ${billId} not found`);
            res.status(404).json({ message: "Bill not found" });
            return;
        }

        // Cập nhật các trường thông tin của hóa đơn
        if (paymentStatus) {
            bill.paymentStatus = paymentStatus;
            console.log(`Updated paymentStatus to: ${paymentStatus}`);
        }
        if (paymentMethod) {
            bill.paymentMethod = paymentMethod;
            console.log(`Updated paymentMethod to: ${paymentMethod}`);
        }
        if (transactionId) {
            bill.transactionId = transactionId;
            console.log(`Updated transactionId to: ${transactionId}`);
        }

        // Lưu hóa đơn đã cập nhật vào DB
        await bill.save();
        console.log(`Bill with ID: ${billId} updated successfully`);

        res.status(200).json({ message: 'Bill updated successfully', bill });
    } catch (error) {
        console.error('Error updating bill:', error);
        next(error);
    }
};

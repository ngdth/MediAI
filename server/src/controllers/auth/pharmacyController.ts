import Bill from '../../models/Bill';
import Appointment, { AppointmentStatus } from '../../models/Appointment';
import { Request, Response, NextFunction } from 'express';
import { calculateTotalAmount } from '../../utils/calc';

export const getDoneAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const pharmacyId = req.user?.id; // Lấy pharmacyId từ token (req.user đã được xác thực)

        if (!pharmacyId) {
            res.status(400).json({ message: "Pharmacy ID not found in token" });
            return;
        }

        // Tìm tất cả các appointment có status "Done" và pharmacyId trùng với tài khoản nhà thuốc đang đăng nhập
        const appointments = await Appointment.find({
            status: AppointmentStatus.DONE,
            pharmacyId: pharmacyId  // Sử dụng pharmacyId từ token
        })
        .populate('userId', 'username email')  // Lấy thông tin bệnh nhân
        .populate('doctorId', 'username email')  // Lấy thông tin bác sĩ
        .populate('pharmacyId', 'name email');  // Lấy thông tin nhà thuốc

        if (appointments.length === 0) {
            res.status(404).json({ message: "No done appointments found for this pharmacy" });
            return;
        }

        res.status(200).json({
            message: "Done appointments retrieved successfully",
            data: appointments,
        });
    } catch (error) {
        console.error("Error fetching done appointments:", error);
        res.status(500).json({ message: "Error fetching done appointments", error });
    }
};

export const createBill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { appointmentId, consultationFee, testFees, medicineFees, additionalFees, paymentMethod } = req.body;

        const appointment = await Appointment.findById(appointmentId)
            .populate('userId', 'username phone email specialization')
            .populate('doctorId', 'username specialization')
            .lean();

        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
        }

        const totalAmount = calculateTotalAmount(consultationFee, testFees, medicineFees, additionalFees);

        const newBill = new Bill({
            billId: `BILL-${Date.now()}`,
            appointmentId,
            dateIssued: new Date(),
            paymentStatus: 'Pending',
            paymentMethod,
            patientName: appointment?.userId.username,
            patientPhone: appointment?.userId.phone,
            patientEmail: appointment?.userId.email,
            doctorName: appointment?.doctorId?.username,
            doctorSpecialization: appointment?.doctorId?.specialization,
            testFees,
            medicineFees,
            additionalFees,
            totalAmount,
            paidAmount: 0
        });

        await newBill.save();

        res.status(201).json({ message: 'Bill created successfully', bill: newBill });
    } catch (error) {
        next(error);
    }
};


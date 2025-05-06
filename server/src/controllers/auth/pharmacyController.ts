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
    console.log("Starting getDoneAppointments function");

    try {
        const userId = req.user?.id; // Lấy ID người dùng từ token (req.user đã được xác thực)
        const userRole = req.user?.role; // Lấy role của người dùng (pharmacy hoặc doctor)
        console.log(`Extracted userId from token: ${userId}`);
        console.log(`User role: ${userRole}`);

        if (!userId) {
            console.log("Error: User ID not found in token");
            res.status(400).json({ message: "User ID not found in token" });
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
            res.status(404).json({ message: "No done appointments found for this user" });
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
        console.log('Request body:', req.body);

        // Kiểm tra nếu appointmentId không được cung cấp
        if (!appointmentId) {
            res.status(400).json({ message: "Appointment ID is required" });
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
            res.status(404).json({ message: "Appointment not found" });
            return;
        }

        // Log thông tin doctor để debug
        console.log('Doctor info:', appointment.doctorId);
        // Lấy thông tin người dùng
        const user = appointment.userId as { email?: string; _id?: string };
        const userEmail = user?.email;
        const userId = user?._id;

        if (!userEmail || !userId) {
            console.error("❌ Không tìm thấy thông tin bệnh nhân!");
            res.status(500).json({ message: "Patient information not found" });
            return;
        }
        console.log("✅ Patient info found - Email:", userEmail, "ID:", userId);

        // Kiểm tra paymentMethod hợp lệ
        const validPaymentMethods = ["MOMO", "Cash"];
        if (!validPaymentMethods.includes(paymentMethod)) {
            res.status(400).json({ message: "Invalid payment method" });
            return;
        }

        // Tính tổng tiền
        const totalAmount = calculateTotalAmount(testFees, medicineFees, additionalFees);
        console.log("✅ Total amount calculated:", totalAmount);

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
        console.log("✅ Doctor info extracted:", { doctorName, doctorSpecialization, doctorId });


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

        // Update Appointment Status
        await Appointment.findByIdAndUpdate(appointmentId, { status: AppointmentStatus.BILL_CREATED });
        console.log("✅ Appointment status updated to BILL_CREATED");


        res.status(201).json({
            message: 'Bill created successfully',
            bill: savedBill,
            billId: savedBill._id
        });

        // Gửi email thông báo
        if (userEmail) {
            await sendEmail(userEmail, newBill, "create_bill");
            console.log("✅ Email sent to patient:", userEmail);
        }
    } catch (error) {
        console.error("❌ Error creating bill:", error);
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

export const getBillsByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user.id;
        if (!userId) {
            res.status(401).json({ message: "User ID not found" });
            return;
        }

        const bills = await Bill.find({ userId });

        if (!bills || bills.length === 0) {
            res.status(404).json({ message: "No bills found" });
            return;
        }

        res.status(200).json({
            message: "Bills retrieved successfully",
            count: bills.length,
            bills
        });
    } catch (error) {
        console.error("Error fetching bills:", error);
        res.status(500).json({ message: "Internal server error", error });
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

        const diagnosisDetails = await DiagnosisDetails.find({ appointmentId: (bill.appointmentId as any)._id }).populate('doctorId', 'username');
        console.log('Diagnosis details:', diagnosisDetails);

        console.log('Bill found:', bill, diagnosisDetails);
        res.status(200).json({ bill, diagnosisDetails });
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

// Update medicine prices in a bill
export const updateMedicinesPrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { billId } = req.params;
        const { medicineFees } = req.body;

        console.log(`Attempting to update medicine prices for bill with ID: ${billId}`);

        // Find the bill by _id
        const bill = await Bill.findById(billId);
        if (!bill) {
            console.log(`Bill with ID: ${billId} not found`);
            res.status(404).json({ message: "Bill not found" });
            return;
        }

        // Check if the bill is in process of payment or already paid
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
            console.log(`Invalid medicineFees array`);
            res.status(400).json({ message: "Invalid medicineFees array" });
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
                res.status(400).json({ message: `Invalid medicine entry at index ${i}` });
                return;
            }
        }

        // Update medicineFees
        bill.medicineFees = medicineFees;

        // Recalculate totalAmount
        bill.totalAmount = calculateTotalAmount(bill.testFees, bill.medicineFees, bill.additionalFees);

        // Save the updated bill
        await bill.save();
        console.log(`Bill with ID: ${billId} updated successfully`);

        res.status(200).json({ message: 'Medicine prices updated successfully', bill });
    } catch (error) {
        console.error('Error updating medicine prices:', error);
        console.log(`Error details: ${error}`);
        next(error);
    }
};
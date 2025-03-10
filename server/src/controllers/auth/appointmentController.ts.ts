// src/controllers/appointmentController.ts
import { Request, Response, NextFunction } from 'express';
import Appointment, { AppointmentStatus } from '../../models/Appointment'
import User from '../../models/User';
import mongoose from 'mongoose';
import Schedule from '../../models/Schedule';
import { sendEmail  } from "../../config/email";

// ✅ API: Đặt lịch hẹn & gửi email xác nhận
export const createAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { patientName, date, time, symptoms } = req.body;

        // ✅ Kiểm tra input, bỏ yêu cầu `doctorId`
        if (!patientName || !date || !time || !symptoms) {
            res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
            return;
        }

        // ✅ Tạo lịch hẹn không cần `doctorId`
        const newAppointment = new Appointment({
            userId,
            patientName,
            date,
            time,
            symptoms,
            status: AppointmentStatus.PENDING
        });

        await newAppointment.save();

        // ✅ Lấy thông tin user
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User không tồn tại' });
            return;
        }

        // 📩 Gửi email xác nhận đặt lịch
        await sendEmail(user.email, {
            patientName,
            date,
            time,
            symptoms
        }, "appointment");

        res.status(201).json({
            message: 'Yêu cầu đặt lịch hẹn đã được gửi, vui lòng kiểm tra email để xác nhận.',
            appointment: newAppointment
        });

    } catch (error) {
        next(error);
    }
};

export const getPendingAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const appointments = await Appointment.find({ status: "Pending" });
        res.status(200).json({ message: "Danh sách lịch hẹn cần xử lý", data: appointments });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách lịch hẹn", error });
    }
};

export const updateAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["Accepted", "Rejected"].includes(status)) {
            res.status(400).json({ message: "Trạng thái không hợp lệ" });
            return;
        }

        const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true });

        if (!appointment) {
            res.status(404).json({ message: "Lịch hẹn không tồn tại" });
            return;
        }

        res.status(200).json({ message: `Lịch hẹn đã được cập nhật thành ${status}`, data: appointment });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật lịch hẹn", error });
    }
};

export const assignDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { doctorId } = req.body;

        if (!doctorId) {
            res.status(400).json({ message: "Cần chọn bác sĩ để gán lịch hẹn" });
            return;
        }

        const appointment = await Appointment.findByIdAndUpdate(id, { doctorId, status: "Assigned" }, { new: true });

        if (!appointment) {
            res.status(404).json({ message: "Lịch hẹn không tồn tại" });
            return;
        }

        res.status(200).json({ message: "Đã chỉ định bác sĩ", data: appointment });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi gán bác sĩ", error });
    }
};

// // Book appointment
// export const bookAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         const userId = req.user?.id;
//         const { doctorId, date, time } = req.body;

//         if (!mongoose.Types.ObjectId.isValid(doctorId)) {
//             res.status(400).json({ message: "doctorId không hợp lệ" });
//             return;
//         }

//         // ✅ Kiểm tra xem lịch khám có tồn tại không
//         const schedule = await Schedule.findOne({
//             doctorId,
//             "availableSlots.date": date,
//             "availableSlots.time": time,
//         });

//         if (!schedule) {
//             res.status(400).json({ message: "Lịch khám của bác sĩ không có khung giờ này" });
//             return;
//         }

//         // ✅ Lấy slot cụ thể
//         const slotIndex = schedule.availableSlots.findIndex(slot =>
//             slot.date.toISOString() === new Date(date).toISOString() && slot.time === time
//         );

//         if (slotIndex === -1) {
//             res.status(400).json({ message: "Khung giờ này không tồn tại trong lịch khám của bác sĩ" });
//             return;
//         }

//         if (schedule.availableSlots[slotIndex].isBooked) {
//             res.status(400).json({ message: "Khung giờ này đã có người đặt" });
//             return;
//         }

//         // ✅ Cập nhật `isBooked` thành `true`
//         schedule.availableSlots[slotIndex].isBooked = true;
//         await schedule.save();

//         // ✅ Tạo lịch hẹn
//         const newAppointment = new Appointment({
//             doctorId,
//             userId,
//             date,
//             time,
//             status: AppointmentStatus.PENDING,
//         });

//         await newAppointment.save();

//         res.status(201).json({
//             message: 'Appointment booked successfully',
//             appointment: newAppointment,
//             updatedSchedule: schedule, // ✅ Trả về lịch đã được cập nhật
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// View all appointments
export const viewAllAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const appointments = await Appointment.find().populate('userId', 'username email').populate('doctorId', 'username email');
        res.status(200).json({
            message: 'Appointments retrieved successfully',
            data: appointments,
        });
    } catch (error) {
        next(error);
    }
};

// ROLE: NURSE
// Upate appointment
// export const updateAppointmentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         const { id } = req.params;
//         const { status } = req.body;

//         if (![AppointmentStatus.ACCEPTED, AppointmentStatus.REJECTED].includes(status)) {
//             res.status(400).json({ message: 'Invalid status' });
//             return;
//         }

//         if (req.user?.role !== 'nurse') {
//             res.status(403).json({ message: 'Permission denied' });
//             return;
//         }

//         if (status === AppointmentStatus.REJECTED) {
//             await Appointment.findByIdAndDelete(id);
//             res.status(200).json({ message: 'Appointment has been removed' });
//             return;
//         }

//         const appointment = await Appointment.findById(id);
//         if (!appointment) {
//             res.status(404).json({ message: 'Appointment not found' });
//             return;
//         }

//         const user = await User.findById(appointment.userId);
//         if (!user) {
//             res.status(404).json({ message: 'User not found' });
//             return;
//         }

//         // update appointment status
//         appointment.status = AppointmentStatus.ACCEPTED;
//         appointment.patientName = user.username;
//         await appointment.save();

//         res.status(200).json({
//             message: 'Appointment accepted successfully',
//             data: appointment,
//         });
//     } catch (error) {
//         next(error);
//     }
// };
// get All appointments of all user
export const getUserAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;

        if (!userId) {
            res.status(403).json({ message: 'Permission denied' });
            return;
        }

        let filter = {};

        if (userRole === 'nurse') {

            filter = {};
        } else {
            // ✅ Nếu là user, chỉ lấy lịch hẹn của chính mình
            filter = { userId };
        }

        const appointments = await Appointment.find(filter)
            .populate('doctorId', 'username email')
            .populate('userId', 'username email')
            .sort({ date: -1, time: -1 });

        if (appointments.length === 0) {
            res.status(404).json({ message: 'Not found any appointment' });
            return;
        }

        res.status(200).json({
            message: 'Appointments retrieved successfully',
            data: appointments,
        });
    } catch (error) {
        next(error);
    }
};

export const getDetailAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'Invalid appointment ID' });
            return;
        }

        if (!userId) {
            res.status(403).json({ message: 'Permission denied' });
            return;
        }

        // Get appointment by id
        const appointment = await Appointment.findById(id)
            .populate('doctorId', 'username email')
            .populate('userId', 'username email');

        if (!appointment) {
            res.status(404).json({ message: 'Not found any appointment' });
            return;
        }

        // If user is not nurse and not owner of appointment
        if (userRole !== 'nurse' && appointment.userId.toString() !== userId) {
            res.status(403).json({ message: 'Permission denied to get this appointment' });
            return;
        }

        res.status(200).json({
            message: 'Appointment retrieved successfully',
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};
export const cancelAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'Invalid appointment ID' });
            return;
        }


        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }


        if (userRole !== 'nurse' && appointment.userId.toString() !== userId) {
            res.status(403).json({ message: 'You do not have permission to cancel this appointment' });
            return;
        }

        if (userRole !== 'nurse' && appointment.status !== AppointmentStatus.PENDING) {
            res.status(400).json({ message: 'You can only cancel appointments that are still pending' });
            return;
        }


        await Appointment.findByIdAndDelete(id);


        // await Schedule.findOneAndUpdate(
            // { doctorId: appointment.doctorId, "availableSlots.date": appointment.date, "availableSlots.time": appointment.time },
        //     { $set: { "availableSlots.$.isBooked": false } }
        // );

        res.status(200).json({
            message: 'Appointment cancelled successfully',
        });
    } catch (error) {
        next(error);
    }
};

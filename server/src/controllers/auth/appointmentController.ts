import { Request, Response, NextFunction } from 'express';
import Appointment, { AppointmentStatus } from '../../models/Appointment'
import User from '../../models/User';
import mongoose from 'mongoose';
import Schedule from '../../models/Schedule';
import { sendEmail } from "../../config/email";

export const createAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { patientName, date, time, symptoms } = req.body;

        if (!patientName || !date || !time || !symptoms) {
            res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
            return;
        }
        const newAppointment = new Appointment({
            userId,
            patientName,
            date,
            time,
            symptoms,
            status: AppointmentStatus.PENDING
        });

        await newAppointment.save();
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User không tồn tại' });
            return;
        }
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

export const bookAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { patientName, date, time, symptoms, doctorId } = req.body; 

        if (!patientName || !date || !time || !symptoms || !doctorId) {
            res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
            return;
        }

        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== "doctor") {
            res.status(404).json({ message: "Bác sĩ không tồn tại" });
            return;
        }

        const newAppointment = new Appointment({
            userId,
            doctorId, 
            patientName,
            date,
            time,
            symptoms,
            status: AppointmentStatus.ASSIGNED
        });

        await newAppointment.save();

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User không tồn tại" });
            return;
        }

        await sendEmail(user.email, {
            patientName,
            date,
            time,
            symptoms,
            doctorName: doctor.username
        }, "appointment");

        res.status(201).json({
            message: "Yêu cầu đặt lịch hẹn đã được gửi, vui lòng kiểm tra email để xác nhận.",
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

export const updateAppointmentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (![AppointmentStatus.ACCEPTED, AppointmentStatus.REJECTED, AppointmentStatus.ASSIGNED].includes(status)) {
            res.status(400).json({ message: "Invalid status" });
            return;
        }

        const appointment = await Appointment.findById(id).populate("userId", "email username").populate("doctorId", "username");
        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }

        if (status === AppointmentStatus.REJECTED) {
            await Appointment.findByIdAndDelete(id);
            res.status(200).json({ message: "Appointment has been removed" });
            return;
        }

        appointment.status = status;
        await appointment.save();

        if (status === AppointmentStatus.ASSIGNED) {
            if (!appointment.doctorId) {
                res.status(400).json({ message: "Doctor must be assigned before confirming appointment." });
                return;
            }

            const emailData = {
                patientName: appointment.patientName,
                doctorName: (appointment.doctorId as any).username,
                date: appointment.date,
                time: appointment.time,
            };

            await sendEmail((appointment.userId as any).email, emailData, "appointment_assigned");
        }

        res.status(200).json({
            message: "Appointment updated successfully",
            data: appointment,
        });
    } catch (error) {
        console.error("Error updating appointment status:", error);
        next(error);
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

export const addDiagnosisAndPrescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params; 
        const { diagnosis, prescription } = req.body;
        if (!diagnosis || !prescription) {
            res.status(400).json({ message: "Diagnosis and prescription are required" });
            return;
        }

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }

        appointment.diagnosis = diagnosis;
        appointment.prescription = prescription;
        appointment.status = AppointmentStatus.ACCEPTED; 

        await appointment.save();

        res.status(200).json({
            message: "Diagnosis and prescription added successfully",
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};

export const createResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { vitals, tests, diagnosisDetails } = req.body;

    try {
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }

        appointment.vitals = vitals;
        appointment.tests = tests;
        appointment.diagnosisDetails = diagnosisDetails;
        appointment.status = AppointmentStatus.WAITINGPRESCRIPTION;

        await appointment.save();

        res.status(200).json({
            message: 'Result and prescription created successfully',
            data: appointment
        });
    } catch (error) {
        next(error);
    }
};

export const createPrescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { prescription } = req.body;

    try {
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }

        appointment.prescription = prescription;
        appointment.status = AppointmentStatus.PRESCRIPTION_CREATED;

        await appointment.save();

        res.status(200).json({
            message: 'Prescription created successfully',
            data: appointment
        });
    } catch (error) {
        next(error);
    }
};

export const getWaitingPrescriptionAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const appointments = await Appointment.find({ status: "WaitingPrescription" })
            .populate('userId', 'username email')
            .populate('doctorId', 'username email');

        if (appointments.length === 0) {
            res.status(404).json({ message: "No appointments found with status WAITINGPRESCRIPTION" });
            return;
        }

        res.status(200).json({
            message: "Appointments retrieved successfully",
            data: appointments,
        });
    } catch (error) {
        console.error("Error fetching waiting prescription appointments:", error);
        res.status(500).json({ message: "Error fetching waiting prescription appointments", error });
    }
};

export const getPrescriptionCreatedAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const doctorId = req.user?.id;  // Lấy doctorId từ token (req.user đã được xác thực)

        if (!doctorId) {
            res.status(400).json({ message: "Doctor ID not found in token" });
            return;
        }

        // Tìm tất cả các appointment có status "Prescription_created" và doctorId là bác sĩ hiện tại
        const appointments = await Appointment.find({
            status: AppointmentStatus.PRESCRIPTION_CREATED,
            doctorId: doctorId  // Sử dụng doctorId từ token
        })
        .populate('userId', 'username email')  // Lấy thông tin user (bệnh nhân)
        .populate('doctorId', 'username email');  // Lấy thông tin bác sĩ

        if (appointments.length === 0) {
            res.status(404).json({ message: "No appointments found with status 'Prescription_created'" });
            return;
        }

        res.status(200).json({
            message: "Appointments retrieved successfully",
            data: appointments,
        });
    } catch (error) {
        console.error("Error fetching prescription created appointments:", error);
        res.status(500).json({ message: "Error fetching prescription created appointments", error });
    }
};

export const getAppointmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id)
            .populate('userId', 'username email')
            .populate('doctorId', 'username email');

        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }

        res.status(200).json({
            message: "Appointment retrieved successfully",
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};


// View all appointments
export const viewAllAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status } = req.query;

        let filter = {};
        if (status) {
            filter = { status };
        }

        const appointments = await Appointment.find(filter)
            .populate('userId', 'username email')
            .populate('doctorId', 'username email');

        res.status(200).json({
            message: 'Appointments retrieved successfully',
            data: appointments,
        });
    } catch (error) {
        next(error);
    }
};

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

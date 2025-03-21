import { Request, Response, NextFunction } from 'express';
import Appointment, { AppointmentStatus, IAppointment } from '../../models/Appointment';
import Prescription from '../../models/Prescription';
import Vitals from '../../models/Vitals';
import Tests from '../../models/Tests';
import DiagnosisDetails from '../../models/DiagnosisDetails';
import User from '../../models/User';
import mongoose from 'mongoose';
import Schedule from '../../models/Schedule';
import { sendEmail } from "../../config/email";

// Đặt lịch hẹn với bác sĩ
export const bookAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { patientName, age, gender, address, email, phone, date, time, symptoms, medicalHistory, familyMedicalHistory, doctorId } = req.body;

        if (!patientName || !age || !gender || !address || !email || !phone || !date || !time || !symptoms || !doctorId) {
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
            patientName,
            age,
            gender,
            address,
            email,
            phone,
            date,
            time,
            symptoms,
            medicalHistory: {
                personal: medicalHistory,
                family: familyMedicalHistory,
            },
            status: AppointmentStatus.ASSIGNED,
            doctorId: [doctorId],
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
            doctorName: doctor.username,
        }, "appointment");

        res.status(201).json({
            message: "Yêu cầu đặt lịch hẹn đã được gửi, vui lòng kiểm tra email để xác nhận.",
            appointment: newAppointment,
        });
    } catch (error) {
        next(error);
    }
};

// Tạo kết quả (Vitals, Tests, DiagnosisDetails)
export const createResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { vitals, tests, diagnosisDetails } = req.body;
    const doctorId = req.user?.id;

    try {
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }

        if (vitals) {
            const newVitals = new Vitals({
                appointmentId: id,
                userId: appointment.userId,
                ...vitals,
            });
            await newVitals.save();
        }

        if (tests) {
            const newTests = new Tests({
                appointmentId: id,
                userId: appointment.userId,
                ...tests,
            });
            await newTests.save();
        }

        if (diagnosisDetails) {
            const newDiagnosisDetails = new DiagnosisDetails({
                appointmentId: id,
                doctorId: doctorId,
                ...diagnosisDetails,
            });
            await newDiagnosisDetails.save();

            if (!appointment.doctorId.includes(doctorId)) {
                appointment.doctorId.push(doctorId);
            }
        }

        appointment.status = AppointmentStatus.WAITINGPRESCRIPTION;
        await appointment.save();

        res.status(200).json({
            message: "Result created successfully",
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};

// Tạo đơn thuốc
export const createPrescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { prescription } = req.body;
    const doctorId = req.user?.id;

    try {
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }

        if (prescription && Array.isArray(prescription)) {
            for (const presc of prescription) {
                const newPrescription = new Prescription({
                    appointmentId: id,
                    doctorId: doctorId,
                    ...presc,
                });
                await newPrescription.save();
            }

            if (!appointment.doctorId.includes(doctorId)) {
                appointment.doctorId.push(doctorId);
            }
        }

        appointment.status = AppointmentStatus.PRESCRIPTION_CREATED;
        await appointment.save();

        res.status(200).json({
            message: 'Prescription created successfully',
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};

// Lấy danh sách lịch hẹn đang chờ đơn thuốc
export const getWaitingPrescriptionAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const appointments = await Appointment.find({ status: "WaitingPrescription" })
            .populate('userId', 'username email')
            .populate('doctorId', 'username email');

        if (appointments.length === 0) {
            res.status(404).json({ message: "No appointments found with status WAITINGPRESCRIPTION" });
            return;
        }

        const appointmentsWithDetails = await Promise.all(appointments.map(async (appointment) => {
            const prescriptions = await Prescription.find({ appointmentId: appointment._id }).populate('doctorId', 'username');
            const vitals = await Vitals.find({ appointmentId: appointment._id });
            const tests = await Tests.find({ appointmentId: appointment._id });
            const diagnosisDetails = await DiagnosisDetails.find({ appointmentId: appointment._id }).populate('doctorId', 'username');

            return {
                appointment,
                prescriptions,
                vitals,
                tests,
                diagnosisDetails,
            };
        }));

        res.status(200).json({
            message: "Appointments retrieved successfully",
            data: appointmentsWithDetails,
        });
    } catch (error) {
        console.error("Error fetching waiting prescription appointments:", error);
        res.status(500).json({ message: "Error fetching waiting prescription appointments", error });
    }
};

// Lấy danh sách lịch hẹn đã tạo đơn thuốc
export const getPrescriptionCreatedAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const doctorId = req.user?.id;

        if (!doctorId) {
            res.status(400).json({ message: "Doctor ID not found in token" });
            return;
        }

        const appointments = await Appointment.find({
            status: AppointmentStatus.PRESCRIPTION_CREATED,
            doctorId: doctorId,
        })
            .populate('userId', 'username email')
            .populate('doctorId', 'username email');

        if (appointments.length === 0) {
            res.status(404).json({ message: "No appointments found with status 'Prescription_created'" });
            return;
        }

        const appointmentsWithDetails = await Promise.all(appointments.map(async (appointment) => {
            const prescriptions = await Prescription.find({ appointmentId: appointment._id }).populate('doctorId', 'username');
            const vitals = await Vitals.find({ appointmentId: appointment._id });
            const tests = await Tests.find({ appointmentId: appointment._id });
            const diagnosisDetails = await DiagnosisDetails.find({ appointmentId: appointment._id }).populate('doctorId', 'username');

            return {
                appointment,
                prescriptions,
                vitals,
                tests,
                diagnosisDetails,
            };
        }));

        res.status(200).json({
            message: "Appointments retrieved successfully",
            data: appointmentsWithDetails,
        });
    } catch (error) {
        console.error("Error fetching prescription created appointments:", error);
        res.status(500).json({ message: "Error fetching prescription created appointments", error });
    }
};

// Lấy thông tin chi tiết lịch hẹn theo ID
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

        const prescriptions = await Prescription.find({ appointmentId: id }).populate('doctorId', 'username');
        const vitals = await Vitals.find({ appointmentId: id });
        const tests = await Tests.find({ appointmentId: id });
        const diagnosisDetails = await DiagnosisDetails.find({ appointmentId: id }).populate('doctorId', 'username');

        res.status(200).json({
            message: "Appointment retrieved successfully",
            data: {
                appointment,
                prescriptions,
                vitals,
                tests,
                diagnosisDetails,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Xem tất cả lịch hẹn
export const viewAllAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status, doctorId } = req.query;

        let filter = {};
        if (status) {
            filter = { ...filter, status };
        }
        if (doctorId) {
            filter = { ...filter, doctorId };
        }

        const appointments = await Appointment.find(filter)
            .populate('userId', 'username email')
            .populate('doctorId', 'username email');

        const appointmentsWithDetails = await Promise.all(appointments.map(async (appointment) => {
            const prescriptions = await Prescription.find({ appointmentId: appointment._id }).populate('doctorId', 'username');
            const vitals = await Vitals.find({ appointmentId: appointment._id });
            const tests = await Tests.find({ appointmentId: appointment._id });
            const diagnosisDetails = await DiagnosisDetails.find({ appointmentId: appointment._id }).populate('doctorId', 'username');

            return {
                appointment,
                prescriptions,
                vitals,
                tests,
                diagnosisDetails,
            };
        }));

        res.status(200).json({
            message: 'Appointments retrieved successfully',
            data: appointmentsWithDetails,
        });
    } catch (error) {
        next(error);
    }
};

// Lấy tất cả lịch hẹn của người dùng
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

        const appointmentsWithDetails = await Promise.all(appointments.map(async (appointment) => {
            const prescriptions = await Prescription.find({ appointmentId: appointment._id }).populate('doctorId', 'username');
            const vitals = await Vitals.find({ appointmentId: appointment._id });
            const tests = await Tests.find({ appointmentId: appointment._id });
            const diagnosisDetails = await DiagnosisDetails.find({ appointmentId: appointment._id }).populate('doctorId', 'username');

            return {
                appointment,
                prescriptions,
                vitals,
                tests,
                diagnosisDetails,
            };
        }));

        res.status(200).json({
            message: 'Appointments retrieved successfully',
            data: appointmentsWithDetails,
        });
    } catch (error) {
        next(error);
    }
};

// Lấy chi tiết lịch hẹn
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

        const appointment = await Appointment.findById(id)
            .populate('doctorId', 'username email')
            .populate('userId', 'username email');

        if (!appointment) {
            res.status(404).json({ message: 'Not found any appointment' });
            return;
        }

        if (userRole !== 'nurse' && appointment.userId.toString() !== userId) {
            res.status(403).json({ message: 'Permission denied to get this appointment' });
            return;
        }

        const prescriptions = await Prescription.find({ appointmentId: id }).populate('doctorId', 'username');
        const vitals = await Vitals.find({ appointmentId: id });
        const tests = await Tests.find({ appointmentId: id });
        const diagnosisDetails = await DiagnosisDetails.find({ appointmentId: id }).populate('doctorId', 'username');

        res.status(200).json({
            message: 'Appointment retrieved successfully',
            data: {
                appointment,
                prescriptions,
                vitals,
                tests,
                diagnosisDetails,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Hủy lịch hẹn
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

        await Prescription.deleteMany({ appointmentId: id });
        await Vitals.deleteMany({ appointmentId: id });
        await Tests.deleteMany({ appointmentId: id });
        await DiagnosisDetails.deleteMany({ appointmentId: id });

        await Appointment.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Appointment cancelled successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Xóa bác sĩ khỏi lịch hẹn
export const removeDoctorFromAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
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

        // Xóa tất cả doctorId và cập nhật status về Pending
        appointment.doctorId = [];
        appointment.status = AppointmentStatus.PENDING;

        await appointment.save();

        res.status(200).json({
            message: 'All doctors removed from appointment successfully',
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};

// Gán lịch hẹn cho nhà thuốc
export const assignToPharmacy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { pharmacyId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(pharmacyId)) {
            res.status(400).json({ message: "Invalid appointment ID or pharmacy ID" });
            return;
        }

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }

        appointment.pharmacyId = pharmacyId;
        appointment.status = AppointmentStatus.DONE;

        await appointment.save();

        res.status(200).json({
            message: "Appointment assigned to pharmacy successfully",
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};
import { Request, Response, NextFunction } from 'express';
import Appointment, { AppointmentStatus, IAppointment } from '../../models/Appointment';
import Prescription from '../../models/Prescription';
import Vitals from '../../models/Vitals';
import Tests from '../../models/Tests';
import DiagnosisDetails from '../../models/DiagnosisDetails';
import User, { IDoctor } from '../../models/User';
import mongoose from 'mongoose';
import Schedule from '../../models/Schedule';
import { sendEmail } from "../../config/email";

const isValidAppointmentId = (id: string): boolean => {
    const idRegex = /^\d{8}_\d{3}$/;
    return idRegex.test(id);
};

// Tạo lịch hẹn không có bác sĩ
export const createAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { patientName, phone, email, address, gender, age, date, time, symptoms } = req.body;

        if (!patientName || !date || !time || !symptoms) {
            res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
            return;
        }

        const newAppointment = new Appointment({
            userId,
            patientName,
            phone,
            email,
            address,
            gender,
            age,
            date,
            time,
            symptoms,
            status: AppointmentStatus.PENDING,
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
            symptoms,
        }, "appointment");

        res.status(201).json({
            message: 'Yêu cầu đặt lịch hẹn đã được gửi, vui lòng kiểm tra email để xác nhận.',
            appointment: newAppointment,
        });
    } catch (error) {
        next(error);
    }
};

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
        if (!doctor || (doctor.role !== "doctor" && doctor.role !== "head of department")) {
            res.status(404).json({ message: "Bác sĩ không tồn tại" });
            return;
        }

        const schedule = await Schedule.findOne({
            doctorId,
            availableSlots: {
                $elemMatch: { date: new Date(date), time, isBooked: false },
            },
        });

        if (!schedule) {
            res.status(400).json({ message: "Không tìm thấy lịch khả dụng hoặc lịch đã được đặt trước." });
            return;
        }

        await Schedule.updateOne(
            { doctorId, "availableSlots.date": new Date(date), "availableSlots.time": time },
            { $set: { "availableSlots.$[element].isBooked": true } },
            { arrayFilters: [{ "element.date": new Date(date), "element.time": time }] }
        );

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
            isDoctorAssignedByPatient: true,
        });

        await newAppointment.save();

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User không tồn tại" });
            return;
        }

        res.status(201).json({
            message: "Yêu cầu đặt lịch hẹn đã được gửi, vui lòng kiểm tra email để xác nhận.",
            appointment: newAppointment,
        });

        await sendEmail(user.email, {
            patientName,
            date,
            time,
            symptoms,
            doctorName: doctor.username,
        }, "appointment");
    } catch (error) {
        next(error);
    }
};

// Lấy danh sách lịch hẹn đang chờ xử lý
export const getPendingAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const appointments = await Appointment.find({ status: "Pending" })
            .populate('userId', 'username email')
            .populate('doctorId', 'username email');

        res.status(200).json({ message: "Danh sách lịch hẹn cần xử lý", data: appointments });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách lịch hẹn", error });
    }
};

// Cập nhật trường trong lịch hẹn
export const updateAppointmentField = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { field, subField, value } = req.body;

        if (!field || value === undefined) {
            res.status(400).json({ message: "Trường và giá trị là bắt buộc" });
            return;
        }

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
            return;
        }

        const typedAppointment = appointment as mongoose.Document & IAppointment;

        if (!subField) {
            if (field in typedAppointment) {
                (typedAppointment as any)[field] = value;
            } else {
                res.status(400).json({ message: `Trường '${field}' không hợp lệ` });
                return;
            }
        } else {
            if (!(field in typedAppointment)) {
                (typedAppointment as any)[field] = {};
            }
            if ((typedAppointment as any)[field] && typeof (typedAppointment as any)[field] === 'object') {
                (typedAppointment as any)[field][subField] = value;
            } else {
                res.status(400).json({ message: `Subfield '${subField}' trong '${field}' không hợp lệ` });
                return;
            }
        }

        await typedAppointment.save();

        res.status(200).json({
            message: "Cập nhật trường thành công",
            data: typedAppointment,
        });
    } catch (error) {
        console.error("Error updating appointment field:", error);
        next(error);
    }
};

// Cập nhật trạng thái lịch hẹn
export const updateAppointmentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { status, rejectReason } = req.body;

    try {
        const appointment = await Appointment.findById(id)
            .populate('userId', 'email')
            .populate('doctorId', 'username');

        if (!appointment) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
            return;
        }

        const validStatuses = Object.values(AppointmentStatus);
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                message: "Trạng thái không hợp lệ",
                receivedStatus: status,
                validStatuses: validStatuses,
            });
            return;
        }

        appointment.status = status;
        await appointment.save();

        if (status === AppointmentStatus.ACCEPTED) {
            if (!appointment.doctorId || appointment.doctorId.length === 0) {
                res.status(400).json({ message: "Phải gán bác sĩ trước khi xác nhận lịch hẹn." });
                return;
            }

            const userEmail = (appointment.userId as any)?.email;
            if (!userEmail) {
                res.status(400).json({ message: "Không tìm thấy email người dùng" });
                return;
            }

            const doctorName = (appointment.doctorId[0] as any)?.username || "Unknown Doctor";

            const emailData = {
                patientName: appointment.patientName,
                doctorName: doctorName,
                date: appointment.date,
                time: appointment.time,
            };

            try {
                await sendEmail(userEmail, emailData, "appointment_assigned");
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
            }
        }

        if (status === AppointmentStatus.REJECTED) {
            if (!rejectReason) {
                res.status(400).json({ message: "Lý do từ chối là bắt buộc khi từ chối lịch hẹn." });
                return;
            }

            const userEmail = (appointment.userId as any)?.email;
            if (!userEmail) {
                res.status(400).json({ message: "Không tìm thấy email người dùng" });
                return;
            }

            const emailData = {
                patientName: appointment.patientName,
                doctorName: (appointment.doctorId as any)?.username || "Unknown Doctor",
                date: appointment.date,
                time: appointment.time,
                rejectReason: rejectReason, // Gửi lý do từ chối vào email
            };

            try {
                await sendEmail(userEmail, emailData, "appointment_rejected");
            } catch (emailError) {
                console.error("Failed to send rejection email:", emailError);
            }
        }

        res.status(200).json({
            message: "Cập nhật trạng thái lịch hẹn thành công",
            data: appointment,
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật trạng thái lịch hẹn", error });
    }
};

// Bác sĩ từ chối lịch hẹn
export const doctorReject = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { rejectReason } = req.body;
    const doctorIdToRemove = req.user.id;

    try {
        const appointment = await Appointment.findById(id).populate('userId', 'email').populate('doctorId', 'username');

        if (!appointment) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
            return;
        }

        if (!rejectReason) {
            res.status(400).json({ message: "Lý do từ chối là bắt buộc khi từ chối lịch hẹn." });
            return;
        }

        if (appointment.isDoctorAssignedByPatient === true) {
            appointment.status = AppointmentStatus.REJECTED;
        } else {
            appointment.status = AppointmentStatus.PENDING;
            appointment.doctorId = appointment.doctorId
                .filter((doc: any) => {
                    const id = typeof doc === 'string' ? doc : doc._id?.toString?.();
                    return id !== doctorIdToRemove.toString();
                })
                .map((doc: any) => typeof doc === 'string' ? doc : doc._id.toString());
        }

        await appointment.save();

        res.status(200).json({
            message: "Từ chối lịch hẹn thành công",
            data: appointment
        });

        const userEmail = (appointment.userId as any)?.email;
        if (userEmail) {
            const emailData = {
                patientName: appointment.patientName,
                doctorName: (appointment.doctorId as any)?.username || "Unknown Doctor",
                date: appointment.date,
                time: appointment.time,
                rejectReason: rejectReason,
            };

            try {
                await sendEmail(userEmail, emailData, "appointment_rejected");
            } catch (emailError) {
                console.error("Failed to send rejection email:", emailError);
            }
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi từ chối lịch hẹn", error });
    }
};

// Gán bác sĩ cho lịch hẹn
export const assignDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { doctorId } = req.body;

        if (!doctorId) {
            res.status(400).json({ message: "Cần chọn bác sĩ để gán lịch hẹn" });
            return;
        }

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ message: "Lịch hẹn không tồn tại" });
            return;
        }

        // Lưu thông tin chuyển giao nếu đây là bác sĩ mới
        const isNewDoctor = !appointment.doctorId.includes(doctorId);
        if (isNewDoctor) {
            // Thêm bác sĩ mới vào mảng doctorId
            appointment.doctorId.push(doctorId);

            // Thêm thông tin chuyển giao nếu đã có bác sĩ trước đó
            if (appointment.doctorId.length > 1) {
                // Khởi tạo mảng transferNotes nếu chưa có
                if (!appointment.transferNotes) {
                    appointment.transferNotes = [];
                }

                // Thêm ghi chú chuyển giao
                appointment.transferNotes.push({
                    date: new Date(),
                    fromDoctorId: appointment.doctorId[appointment.doctorId.length - 2],
                    toDoctorId: doctorId,
                    note: "Chuyển tiếp từ bác sĩ trước",
                    sharedData: true
                });

                // Đánh dấu đây là một phần của quá trình chăm sóc liên tục
                appointment.isContinuousCare = true;
            }
        }
        appointment.status = AppointmentStatus.ASSIGNED;

        await appointment.save();

        const { date, time } = appointment;
        if (!date || !time) {
            res.status(400).json({ message: "Lịch hẹn không hợp lệ, thiếu ngày hoặc giờ" });
            return;
        }

        const schedule = await Schedule.findOne({
            doctorId,
            availableSlots: {
                $elemMatch: { date: new Date(date), time, isBooked: false },
            },
        });

        if (!schedule) {
            res.status(400).json({ message: "Không tìm thấy lịch khả dụng hoặc lịch đã được đặt trước." });
            return;
        }

        await Schedule.updateOne(
            { doctorId, "availableSlots.date": new Date(date), "availableSlots.time": time },
            { $set: { "availableSlots.$[element].isBooked": true } },
            { arrayFilters: [{ "element.date": new Date(date), "element.time": time }] }
        );

        res.status(200).json({ message: "Đã chỉ định bác sĩ", data: appointment });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi gán bác sĩ", error });
    }
};

// Thêm chẩn đoán và đơn thuốc
export const addDiagnosisAndPrescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { diagnosis, prescription } = req.body;
        const doctorId = req.user?.id;

        if (!diagnosis || !prescription) {
            res.status(400).json({ message: "Chẩn đoán và đơn thuốc là bắt buộc" });
            return;
        }

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
            return;
        }

        appointment.diagnosis = diagnosis;

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

        appointment.status = AppointmentStatus.ACCEPTED;
        await appointment.save();

        res.status(200).json({
            message: "Thêm chẩn đoán và đơn thuốc thành công",
            data: appointment,
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
            res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
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
            message: "Tạo kết quả thành công",
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};

// Trong file appointmentController.js
export const updateNurseFields = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { vitals, tests } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
            return;
        }

        if (vitals) {
            const existingVitals = await Vitals.findOne({ appointmentId: id });
            if (existingVitals) {
                await Vitals.updateOne({ appointmentId: id }, { $set: vitals });
            } else {
                const newVitals = new Vitals({
                    appointmentId: id,
                    userId: appointment.userId,
                    ...vitals,
                });
                await newVitals.save();
            }
        }

        if (tests) {
            const existingTests = await Tests.findOne({ appointmentId: id });
            if (existingTests) {
                await Tests.updateOne({ appointmentId: id }, { $set: tests });
            } else {
                const newTests = new Tests({
                    appointmentId: id,
                    userId: appointment.userId,
                    ...tests,
                });
                await newTests.save();
            }
        }

        const updatedVitals = await Vitals.findOne({ appointmentId: id });
        const updatedTests = await Tests.findOne({ appointmentId: id });

        res.status(200).json({
            message: "Cập nhật trường y tá thành công",
            data: {
                appointment,
                vitals: updatedVitals,
                tests: updatedTests,
            },
        });
    } catch (error) {
        console.error("Error updating nurse fields:", error);
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
            res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
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
            message: "Tạo đơn thuốc thành công",
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
            res.status(404).json({ message: "Không tìm thấy lịch hẹn nào với trạng thái ĐANG_CHỜ_ĐƠN_THUỐC" });
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
            message: "Lấy danh sách lịch hẹn thành công",
            data: appointmentsWithDetails,
        });
    } catch (error) {
        console.error("Error fetching waiting prescription appointments:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách lịch hẹn chờ đơn thuốc", error });
    }
};

// Lấy danh sách lịch hẹn đã tạo đơn thuốc
export const getPrescriptionCreatedAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const doctorId = req.user?.id;

        if (!doctorId) {
            res.status(400).json({ message: "Không tìm thấy ID bác sĩ trong token" });
            return;
        }

        const appointments = await Appointment.find({
            status: AppointmentStatus.PRESCRIPTION_CREATED,
            doctorId: doctorId,
        })
            .populate('userId', 'username email')
            .populate('doctorId', 'username email');

        if (appointments.length === 0) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn nào với trạng thái ĐÃ_TẠO_ĐƠN_THUỐC" });
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
            message: "Lấy danh sách lịch hẹn thành công",
            data: appointmentsWithDetails,
        });
    } catch (error) {
        console.error("Error fetching prescription created appointments:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách lịch hẹn đã tạo đơn thuốc", error });
    }
};

// Lấy thông tin chi tiết lịch hẹn theo ID
export const getAppointmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        if (!isValidAppointmentId(id)) {
            console.log('Appointment ID:', id);
            res.status(400).json({ message: "ID lịch hẹn không hợp lệ" });
            return;
        }

        const appointment = await Appointment.findById(id)
            .populate('userId', 'username email')
            .populate('doctorId', 'username email')
            .populate('services');
        console.log('Appointment:', appointment);

        if (!appointment) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
            return;
        }

        const prescriptions = await Prescription.find({ appointmentId: id }).populate('doctorId', 'username');
        const vitals = await Vitals.find({ appointmentId: id });
        const tests = await Tests.find({ appointmentId: id });
        const diagnosisDetails = await DiagnosisDetails.find({ appointmentId: id }).populate('doctorId', 'username');

        res.status(200).json({
            message: "Lấy thông tin lịch hẹn thành công",
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
            message: "Lấy danh sách lịch hẹn thành công",
            data: appointmentsWithDetails,
        });
    } catch (error) {
        next(error);
    }
};

export const viewAppointmentsBySpecialization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const doctorId = req.user?.id;

        if (!doctorId) {
            res.status(401).json({ message: "Không được phép: Không tìm thấy ID bác sĩ trong token." });
            return;
        }

        const doctor = await User.findById(doctorId) as IDoctor | null;
        if (!doctor || !doctor.specialization) {
            res.status(404).json({ message: "Không tìm thấy bác sĩ hoặc chuyên khoa." });
            return;
        }

        const specialization = doctor.specialization;

        // Tìm danh sách tất cả bác sĩ thuộc chuyên khoa này
        const doctorsInSpecialty = await User.find({ specialization }, '_id');
        const doctorIds = doctorsInSpecialty.map((doc) => doc._id);

        // Lọc lịch hẹn theo danh sách doctorId
        const appointments = await Appointment.find({ doctorId: { $in: doctorIds } })
            .populate('userId', 'username email')
            .populate('doctorId', 'username email specialization');

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
            message: "Lấy danh sách lịch hẹn theo chuyên khoa thành công",
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
        console.log(`User ID: ${userId}`);
        console.log(`User Role: ${userRole}`);

        if (!userId) {
            res.status(403).json({ message: "Từ chối quyền truy cập" });
            return;
        }

        let filter = {};

        // if (userRole === 'nurse') {
        //     filter = {};
        // } else {
        //     filter = { userId };
        // }

        if (userRole === 'doctor') {
            // Lấy danh sách bệnh nhân mà bác sĩ đã từng khám
            const doctorAppointments = await Appointment.find({
                doctorId: userId,
                status: { $in: [AppointmentStatus.ASSIGNED, AppointmentStatus.WAITINGPRESCRIPTION, AppointmentStatus.PRESCRIPTION_CREATED, AppointmentStatus.DONE, AppointmentStatus.BILL_CREATED] }
            });

            // Lấy danh sách userId của các bệnh nhân
            const patientIds = doctorAppointments.map(app => app.userId);

            // Lấy tất cả lịch sử khám bệnh của các bệnh nhân này
            filter = { userId: { $in: patientIds } };
        } else if (userRole === 'nurse') {
            // Nurse có thể xem tất cả các trạng thái
        } else {
            // Các user khác, lọc theo userId
            filter = { userId };
            console.log(`User filter applied: ${JSON.stringify(filter)}`);
        }

        const appointments = await Appointment.find(filter)
            .populate('doctorId', 'username email')
            .populate('userId', 'username email')
            .sort({ date: -1, time: -1 });
        console.log(`Appointments found: ${appointments.length}`);

        if (appointments.length === 0) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn nào" });
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
        console.log('Appointments with details:', appointmentsWithDetails);

        res.status(200).json({
            message: "Lấy danh sách lịch hẹn thành công",
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
        console.log(`Requesting details for appointment ID: ${id}`);
        console.log(`User ID: ${userId}`);
        console.log(`User Role: ${userRole}`);

        if (!isValidAppointmentId(id)) {
            console.log(`Invalid appointment ID format: ${id}`);
            res.status(400).json({ message: "ID lịch hẹn không hợp lệ" });
            return;
        }

        if (!userId) {
            res.status(403).json({ message: "Từ chối quyền truy cập" });
            return;
        }

        const appointment = await Appointment.findById(id)
            .populate('doctorId', 'username email')
            .populate('userId', 'username email');
        console.log('Found appointment:', appointment);

        if (!appointment) {
            console.log('No appointment found for ID:', id);
            res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
            return;
        }

        if (Array.isArray(appointment.doctorId) && appointment.doctorId.length > 0) {
            // Kiểm tra xem người dùng hiện tại có phải là một trong các bác sĩ được gán cho lịch hẹn không
            const isDoctorAssigned = appointment.doctorId.some(doc => {
                const docId = typeof doc === 'object' && '_id' in doc
                    ? (doc as { _id: mongoose.Types.ObjectId })._id.toString()
                    : doc.toString();
                return docId === userId;
            });

            console.log('Checking if user is assigned as doctor:', isDoctorAssigned);

            // Nếu người dùng không phải là bác sĩ được gán và cũng không phải là chủ sở hữu lịch hẹn
            if (!isDoctorAssigned && appointment.userId.toString() !== userId) {
                console.log('Permission denied to get this appointment', id);
                res.status(403).json({ message: "Từ chối quyền truy cập để lấy lịch hẹn này" });
                return;
            }
        } else {
            // Nếu doctorId không phải là mảng mà là ObjectId đơn lẻ
            console.log('doctorId is not an array, checking doctorId:', appointment.doctorId.toString());

            if (appointment.doctorId.toString() !== userId && appointment.userId.toString() !== userId) {
                console.log('Permission denied to get this appointment', id);
                res.status(403).json({ message: "Từ chối quyền truy cập để lấy lịch hẹn này" });
                return;
            }
        }

        const prescriptions = await Prescription.find({ appointmentId: id }).populate('doctorId', 'username');
        const vitals = await Vitals.find({ appointmentId: id });
        const tests = await Tests.find({ appointmentId: id });
        const diagnosisDetails = await DiagnosisDetails.find({ appointmentId: id }).populate('doctorId', 'username');
        console.log('Prescriptions:', prescriptions);
        console.log('Vitals:', vitals);
        console.log('Tests:', tests);
        console.log('Diagnosis Details:', diagnosisDetails);

        res.status(200).json({
            message: "Lấy thông tin lịch hẹn thành công",
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
        const { rejectReason } = req.body;

        if (!isValidAppointmentId(id)) {
            res.status(400).json({ message: "ID lịch hẹn không hợp lệ" });
            return;
        }

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
            return;
        }

        if (userRole !== 'nurse' && appointment.userId.toString() !== userId) {
            res.status(403).json({ message: "Bạn không có quyền hủy lịch hẹn này" });
            return;
        }

        if (
            userRole !== 'nurse' &&
            ![AppointmentStatus.PENDING, AppointmentStatus.ASSIGNED].includes(appointment.status)
        ) {
            res.status(400).json({ message: "Chỉ có thể hủy lịch hẹn ở trạng thái Pending hoặc Assigned" });
            return;
        }

        if (!rejectReason || rejectReason.trim() === '') {
            res.status(400).json({ message: "Lý do từ chối không được trống" });
            return;
        }

        const originalStatus = appointment.status;

        await Prescription.deleteMany({ appointmentId: id });
        await Vitals.deleteMany({ appointmentId: id });
        await Tests.deleteMany({ appointmentId: id });
        await DiagnosisDetails.deleteMany({ appointmentId: id });

        appointment.status = AppointmentStatus.CANCELED;
        appointment.rejectReason = rejectReason;
        await appointment.save();

        if (originalStatus === AppointmentStatus.ASSIGNED) {
            const doctorIds = appointment.doctorId;
            const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
            const appointmentTime = appointment.time;

            for (const doctorId of doctorIds) {
                const schedule = await Schedule.findOne({ doctorId });

                if (schedule) {
                    schedule.availableSlots = schedule.availableSlots.map((slot) => {
                        const slotDate = new Date(slot.date).toISOString().split('T')[0];
                        if (
                            slotDate === appointmentDate &&
                            slot.time === appointmentTime &&
                            slot.isBooked === true
                        ) {
                            return { ...slot, isBooked: false };
                        }
                        return slot;
                    });

                    await schedule.save();
                }
            }
        }

        res.status(200).json({
            message: "Hủy lịch hẹn thành công",
        });
    } catch (error) {
        next(error);
    }
};

// Xóa bác sĩ khỏi lịch hẹn
export const removeDoctorFromAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        if (!isValidAppointmentId(id)) {
            res.status(400).json({ message: "ID lịch hẹn không hợp lệ" });
            return;
        }

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
            return;
        }

        appointment.doctorId = [];
        appointment.status = AppointmentStatus.PENDING;

        await appointment.save();

        res.status(200).json({
            message: "Đã xóa tất cả bác sĩ khỏi lịch hẹn thành công",
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

        if (!isValidAppointmentId(id) || !mongoose.Types.ObjectId.isValid(pharmacyId)) {
            res.status(400).json({ message: "ID lịch hẹn hoặc ID nhà thuốc không hợp lệ" });
            return;
        }

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
            return;
        }

        appointment.pharmacyId = pharmacyId;
        appointment.status = AppointmentStatus.DONE;

        await appointment.save();

        res.status(200).json({
            message: "Đã gán lịch hẹn cho nhà thuốc thành công",
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};
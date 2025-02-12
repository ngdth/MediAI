// src/controllers/appointmentController.ts
import { Request, Response, NextFunction } from 'express';
import Appointment, { AppointmentStatus } from '../../models/Appointment'
import User from '../../models/User';

// export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { patientName, date, time, description } = req.body;
//         const doctorId = req.user?.id;

//         const newAppointment = new Appointment({
//             doctorId,
//             patientName,
//             date,
//             time,
//             description,
//         });

//         await newAppointment.save();

//         res.status(201).json({
//             message: 'Appointment created successfully',
//             data: newAppointment,
//         });
//     } catch (error) {
//         next(error);
//     }
// };
// Upate appointment
export const updateAppointmentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (![AppointmentStatus.ACCEPTED, AppointmentStatus.REJECTED].includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }

        if (status === AppointmentStatus.REJECTED){
            await Appointment.findByIdAndDelete(id);
            res.status(200).json({ message: 'Appointment has been removed' });
            return;
        }
    
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }

        const user = await User.findById(appointment.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Cập nhật trạng thái và tên bệnh nhân
        appointment.status = AppointmentStatus.ACCEPTED;
        appointment.patientName = user.username;
        await appointment.save();

        res.status(200).json({
            message: 'Appointment accepted successfully',
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};


// Book appointment
export const bookAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { doctorId, date, time } = req.body;

        const newAppointment = new Appointment({
            doctorId,
            userId,
            date,
            time,
            status: AppointmentStatus.PENDING,
        });

        await newAppointment.save();

        res.status(201).json({
            message: 'Appointment booked successfully',
            data: newAppointment,
        });
    } catch (error) {
        next(error);
    }
};
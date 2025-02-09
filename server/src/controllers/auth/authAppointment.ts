// src/controllers/appointmentController.ts
import { Request, Response, NextFunction } from 'express';
import Appointment from '../../models/Appointment'

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { patientName, date, time, description } = req.body;
        const doctorId = req.user?.id;

        const newAppointment = new Appointment({
            doctorId,
            patientName,
            date,
            time,
            description,
        });

        await newAppointment.save();

        res.status(201).json({
            message: 'Appointment created successfully',
            data: newAppointment,
        });
    } catch (error) {
        next(error);
    }
};
// Update appointment
export const updateAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { patientName, date, time, description } = req.body;
        const { id } = req.params;

        const updatedAppointment = await Appointment.findByIdAndUpdate(id, {
            patientName,
            date,
            time,
            description,
        }, { new: true });

        if (!updatedAppointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }   

        res.status(200).json({
            message: 'Appointment updated successfully',
            data: updatedAppointment,
        });
    } catch (error) {
        next(error);
    }
};
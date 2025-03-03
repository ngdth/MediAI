// src/controllers/scheduleController.ts
import { Request, Response, NextFunction } from 'express';
import Schedule from '../../models/Schedule';
import mongoose from 'mongoose';

// Create schedule
export const createSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doctorId = req.user?.id; // Get doctor id from authenticated user
        const { availableSlots } = req.body;

        const newSchedule = new Schedule({
            doctorId,
            availableSlots,
        });

        await newSchedule.save();

        res.status(201).json({
            message: 'Schedule created successfully',
            data: newSchedule,
        });
    } catch (error) {
        next(error);
    }
};
// API: View doctor schedule
export const getAllSchedules = async (req: Request, res: Response) => {
    try {
        const schedules = await Schedule.getAllSchedules();
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy danh sách lịch khám' });
    }
};

// get schedules by doctor
export const getSchedulesByDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { doctorId } = req.params;

        // Check doctorId is valid or not
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            res.status(400).json({ message: 'doctorId không hợp lệ' });
            return;
        }

        // take schedules by doctorId
        const schedules = await Schedule.find({ doctorId })
            .populate('doctorId', 'name email role') // Take doctor info
            .sort({ createdAt: -1 }); // Sort by createdAt

        if (!schedules || schedules.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy lịch khám cho bác sĩ này' });
            return;
        }

        // return schedules
        res.status(200).json(schedules);
    } catch (error) {
        console.error('Error when getting schedules:', error);
        res.status(500).json({ error: 'Error when getting schedules' });
    }
};
// Update schedule
export const updateSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { availableSlots } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'Invalid schedule ID' });
            return;
        }

        const updatedSchedule = await Schedule.findByIdAndUpdate(
            id,
            { availableSlots },
            { new: true }
        );

        if (!updatedSchedule) {
            res.status(404).json({ message: 'Schedule not found' });
            return;
        }

        res.status(200).json({
            message: 'Schedule updated successfully',
            data: updatedSchedule,
        });
    } catch (error) {
        next(error);
    }
};

// Delete schedule
export const deleteSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'Invalid schedule ID' });
            return;
        }

        const deletedSchedule = await Schedule.findByIdAndDelete(id);

        if (!deletedSchedule) {
            res.status(404).json({ message: 'Schedule not found' });
            return;
        }

        res.status(200).json({
            message: 'Schedule deleted successfully',
            data: deletedSchedule,
        });
    } catch (error) {
        next(error);
    }
};

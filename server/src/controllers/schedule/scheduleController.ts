// src/controllers/scheduleController.ts
import { Request, Response, NextFunction } from 'express';
import Schedule from '../../models/Schedule';

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
export const viewSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { doctorId } = req.params;

        
        if (!doctorId ) {
            res.status(400).json({ message: 'Invalid doctorId format' });
            return;
        }

        const schedule = await Schedule.findOne({ doctorId }).lean(); 

        if (!schedule) {
            res.status(404).json({ message: 'No schedule found for this doctor' });
            return;
        }

        
        res.status(200).json({
            message: 'Doctor schedule retrieved successfully',
            data: schedule,
        })
        return;

    } catch (error) {
        next(error); 
    }
};

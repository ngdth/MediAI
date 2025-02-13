// src/models/schedule.ts
import { Schema, model, Document } from 'mongoose';

interface ISchedule extends Document {
    doctorId: string;
    availableSlots: { date: Date; time: string }[];
}

const scheduleSchema = new Schema<ISchedule>(
    {
        doctorId: { type: Schema.Types.String, ref: 'User', required: true },
        availableSlots: [
            {
                date: { type: Date, required: true },
                time: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
            },
        ],
    },
    { timestamps: true }
);

const Schedule = model<ISchedule>('Schedule', scheduleSchema);

export default Schedule;

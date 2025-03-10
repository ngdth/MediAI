import { Schema, model, Document, Model, Types } from 'mongoose';

// define interface for schedule
interface ISchedule extends Document {
    doctorId: Types.ObjectId;
    availableSlots: { date: Date; time: string; isBooked: boolean }[];
}

// Define interface for Schedule Model with static methods
interface IScheduleModel extends Model<ISchedule> {
    getSchedulesByDoctor(doctorId: string): Promise<ISchedule[]>;
    getAllSchedules(): Promise<ISchedule[]>;
}

// Define Schedule Schema
const scheduleSchema = new Schema<ISchedule>(
    {
        doctorId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
        availableSlots: [
            {
                date: { type: Date, required: true },
                time: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
                isBooked: { type: Boolean, default: false }
            },
        ],
    },
    { timestamps: true }
);

// Add static methods to Schedule Schema
scheduleSchema.statics.getSchedulesByDoctor = async function (doctorId: string) {
    return await this.find({ doctorId }).populate('doctorId', 'name email role');
};

scheduleSchema.statics.getAllSchedules = async function () {
    return await this.find().populate('doctorId', 'name email role');
};

// Create Schedule Model for CRUD
const Schedule = model<ISchedule, IScheduleModel>('Schedule', scheduleSchema);

export default Schedule;

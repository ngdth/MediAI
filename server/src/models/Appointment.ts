// src/models/appointment.ts
import { Schema, model, Document } from 'mongoose';

export enum AppointmentStatus {
    PENDING = 'Pending',
    ACCEPTED = 'Accepted',
    REJECTED = 'Rejected',
}

interface IAppointment extends Document {
    doctorId: string;
    userId: string;
    patientName?: string;
    date: Date;
    time: string;
    status: AppointmentStatus;
}

const appointmentSchema = new Schema<IAppointment>(
    {
        doctorId: { type: Schema.Types.String, ref: 'User', required: true },
        userId: { type: Schema.Types.String, ref: 'User', required: true },
        patientName: { type: String},
        date: { type: Date, required: true },
        time: { type: String, required: true },
        status: { type: String, enum: Object.values(AppointmentStatus), default: AppointmentStatus.PENDING },
    },
    { timestamps: true }
);

const Appointment = model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;

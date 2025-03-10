// src/models/appointment.ts
import { Schema, model, Document } from 'mongoose';

export enum AppointmentStatus {
    PENDING = 'Pending',
    ACCEPTED = 'Accepted',
    REJECTED = 'Rejected',
    ASSIGNED = 'Assigned',
}

interface IAppointment extends Document {
    userId: string;
    patientName?: string;
    date: Date;
    time: string;
    symptoms: string;
    status: AppointmentStatus;
    nurseId?: string;
    doctorId?: string;
    diagnosis?: string;
    prescription?: string;
}

const appointmentSchema = new Schema<IAppointment>(
    {
        userId: { type: Schema.Types.String, ref: 'User', required: true },
        patientName: { type: String },
        date: { type: Date, required: true },
        time: { type: String, required: true },
        symptoms: { type: String, required: true },
        status: { type: String, enum: Object.values(AppointmentStatus), default: AppointmentStatus.PENDING },
        nurseId: { type: Schema.Types.String, ref: 'User' },
        doctorId: { type: Schema.Types.String, ref: 'User' },
        diagnosis: { type: String },
        prescription: { type: String },
    },
    { timestamps: true }
);

const Appointment = model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;

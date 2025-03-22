// src/models/appointment.ts
import { Schema, model, Document } from 'mongoose';

export enum AppointmentStatus {
    PENDING = 'Pending',
    ACCEPTED = 'Accepted',
    REJECTED = 'Rejected',
    ASSIGNED = 'Assigned',
    WAITINGPRESCRIPTION = 'WaitingPrescription',
    PRESCRIPTION_CREATED = 'Prescription_created',
    DONE = 'Done',
    BILL_CREATED = 'Bill_created',
}

interface IAppointment extends Document {
    userId: string;
    patientName?: string;
    age?: number;
    gender?: string;
    address?: string;
    email?: string;
    phone?: string;
    date: Date;
    time: string;
    symptoms: string;
    status: AppointmentStatus;
    nurseId?: string;
    doctorId: string[];
    pharmacyId?: string;
    diagnosis?: string;
    medicalHistory?: {
        personal: string;
        family: string;
    };
    services: string[]; // Array of used services
}

const appointmentSchema = new Schema<IAppointment>(
    {
        userId: { type: Schema.Types.String, ref: 'user', required: true },
        patientName: { type: String },
        age: { type: Number },
        gender: { type: String },
        address: { type: String },
        email: { type: String },
        phone: { type: String },
        date: { type: Date, required: true },
        time: { type: String, required: true },
        symptoms: { type: String, required: true },
        status: { type: String, enum: Object.values(AppointmentStatus), default: AppointmentStatus.PENDING },
        nurseId: { type: Schema.Types.String, ref: 'user' },
        doctorId: [{ type: Schema.Types.String, ref: 'user' }],
        pharmacyId: { type: Schema.Types.String, ref: 'user' },
        diagnosis: { type: String },
        medicalHistory: {
            personal: { type: String },
            family: { type: String },
        },
        services: [{ type: Schema.Types.ObjectId, ref: 'service' }],
    },
    { timestamps: true }
);

const Appointment = model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;
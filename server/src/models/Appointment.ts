// src/models/appointment.ts
import { Schema, model, Document } from 'mongoose';

export enum AppointmentStatus {
    PENDING = 'Pending',
    ACCEPTED = 'Accepted',
    REJECTED = 'Rejected',
    ASSIGNED = 'Assigned',
    WAITINGPRESCRIPTION = 'WaitingPrescription',
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
    vitals?: {
        pulse: string;
        bloodPressure: string;
        temperature: string;
        weight: string;
        height: string;
        generalCondition: string;
    };
    tests?: {
        bloodTest: string;
        urineTest: string;
        xRay: string;
        ultrasound: string;
        mri: string;
        ecg: string;
    };
    diagnosisDetails?: {
        diseaseName: string;
        severity: string;
        treatmentPlan: string;
        followUpSchedule: string;
        specialInstructions: string;
    };
}

const appointmentSchema = new Schema<IAppointment>(
    {
        userId: { type: Schema.Types.String, ref: 'user', required: true },
        patientName: { type: String },
        date: { type: Date, required: true },
        time: { type: String, required: true },
        symptoms: { type: String, required: true },
        status: { type: String, enum: Object.values(AppointmentStatus), default: AppointmentStatus.PENDING },
        nurseId: { type: Schema.Types.String, ref: 'user' },
        doctorId: { type: Schema.Types.String, ref: 'user' },
        diagnosis: { type: String },
        prescription: { type: String },
        vitals: {
            pulse: { type: String },
            bloodPressure: { type: String },
            temperature: { type: String },
            weight: { type: String },
            height: { type: String },
            generalCondition: { type: String },
        },
        tests: {
            bloodTest: { type: String },
            urineTest: { type: String },
            xRay: { type: String },
            ultrasound: { type: String },
            mri: { type: String },
            ecg: { type: String },
        },
        diagnosisDetails: {
            diseaseName: { type: String },
            severity: { type: String },
            treatmentPlan: { type: String },
            followUpSchedule: { type: String },
            specialInstructions: { type: String },
        },
    },
    { timestamps: true }
);

const Appointment = model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;
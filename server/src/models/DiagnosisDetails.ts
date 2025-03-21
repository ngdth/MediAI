// src/models/diagnosisDetails.ts
import { Schema, model, Document } from 'mongoose';

interface IDiagnosisDetails extends Document {
    appointmentId: string;
    doctorId: string;
    diseaseName: string;
    severity: string;
    treatmentPlan: string;
    followUpSchedule: string;
    specialInstructions: string;
    createdAt: Date;
    updatedAt: Date;
}

const diagnosisDetailsSchema = new Schema<IDiagnosisDetails>(
    {
        appointmentId: { type: Schema.Types.String, ref: 'Appointment', required: true },
        doctorId: { type: Schema.Types.String, ref: 'user', required: true },
        diseaseName: { type: String },
        severity: { type: String },
        treatmentPlan: { type: String },
        followUpSchedule: { type: String },
        specialInstructions: { type: String },
    },
    { timestamps: true }
);

const DiagnosisDetails = model<IDiagnosisDetails>('DiagnosisDetails', diagnosisDetailsSchema);

export default DiagnosisDetails;
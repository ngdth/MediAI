// src/models/vitals.ts
import { Schema, model, Document } from 'mongoose';

interface IVitals extends Document {
    appointmentId: string;
    userId: string;
    pulse: string;
    bloodPressure: string;
    temperature: string;
    weight: string;
    height: string;
    generalCondition: string;
    createdAt: Date;
    updatedAt: Date;
}

const vitalsSchema = new Schema<IVitals>(
    {
        appointmentId: { type: Schema.Types.String, ref: 'Appointment', required: true },
        userId: { type: Schema.Types.String, ref: 'user', required: true },
        pulse: { type: String },
        bloodPressure: { type: String },
        temperature: { type: String },
        weight: { type: String },
        height: { type: String },
        generalCondition: { type: String },
    },
    { timestamps: true }
);

const Vitals = model<IVitals>('Vitals', vitalsSchema);

export default Vitals;
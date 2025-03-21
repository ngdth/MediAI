// src/models/tests.ts
import { Schema, model, Document } from 'mongoose';

interface ITests extends Document {
    appointmentId: string;
    userId: string;
    bloodTest: string;
    urineTest: string;
    xRay: string;
    ultrasound: string;
    mri: string;
    ecg: string;
    createdAt: Date;
    updatedAt: Date;
}

const testsSchema = new Schema<ITests>(
    {
        appointmentId: { type: Schema.Types.String, ref: 'Appointment', required: true },
        userId: { type: Schema.Types.String, ref: 'user', required: true },
        bloodTest: { type: String },
        urineTest: { type: String },
        xRay: { type: String },
        ultrasound: { type: String },
        mri: { type: String },
        ecg: { type: String },
    },
    { timestamps: true }
);

const Tests = model<ITests>('Tests', testsSchema);

export default Tests;
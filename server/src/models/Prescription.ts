// src/models/prescription.ts
import { Schema, model, Document } from 'mongoose';

interface IPrescription extends Document {
    appointmentId: string;
    doctorId: string;
    medicineName: string;
    unit: string;
    quantity: string;
    usage: string;
    createdAt: Date;
    updatedAt: Date;
}

const prescriptionSchema = new Schema<IPrescription>(
    {
        appointmentId: { type: Schema.Types.String, ref: 'Appointment', required: true },
        doctorId: { type: Schema.Types.String, ref: 'user', required: true },
        medicineName: { type: String, required: true },
        unit: { type: String, required: true },
        quantity: { type: String, required: true },
        usage: { type: String, required: true },
    },
    { timestamps: true }
);

const Prescription = model<IPrescription>('Prescription', prescriptionSchema);

export default Prescription;
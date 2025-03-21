import { Schema, model, Document } from 'mongoose';

interface IBill extends Document {
    appointmentId: string;
    userId: string;
    dateIssued: Date;
    paymentStatus: string;
    paymentMethod: string;
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    doctorName: string;
    doctorSpecialization: string;
    testFees: { name: string; department: string; price: number }[];
    medicineFees: { name: string; unit: string; quantity: number; unitPrice: number; totalPrice: number; usage: string }[];
    additionalFees: number;
    totalAmount: number;
    transactionId?: string;
}

const billSchema = new Schema<IBill>(
    {
        userId: { type: String, ref: 'User', required: true },
        appointmentId: { type: String, ref: 'Appointment', required: true },
        dateIssued: { type: Date, default: Date.now },
        paymentStatus: { type: String, enum: ['Paid', 'Unpaid', 'Pending'], default: 'Pending' },
        paymentMethod: { type: String, enum: ['MOMO', 'Cash'], default: 'Cash' },
        patientName: { type: String, required: true },
        patientPhone: { type: String },
        patientEmail: { type: String },
        doctorName: { type: String, required: true },
        doctorSpecialization: { type: String },
        testFees: [{ name: String, department: String, price: Number }],
        medicineFees: [{ name: String, unit: String, quantity: Number, unitPrice: Number, totalPrice: Number, usage: String }],
        additionalFees: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        transactionId: { type: String },
    },
    { timestamps: true }
);

const Bill = model<IBill>('Bill', billSchema);

export default Bill;

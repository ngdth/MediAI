// src/models/appointment.ts
import { Schema, model, Document } from 'mongoose';

interface IAppointment extends Document {
    doctorId: string;
    patientName: string;
    date: Date;
    time: string;
    description: string;
}

const appointmentSchema = new Schema<IAppointment>({
    doctorId: { type: Schema.Types.String, ref: 'User', required: true },
    patientName: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    description: { type: String, required: true },
});

const Appointment = model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;
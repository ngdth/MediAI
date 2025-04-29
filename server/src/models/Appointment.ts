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
    CANCELED = 'Canceled',
}

interface ITransferNote {
    date: Date;
    fromDoctorId: string;
    toDoctorId: string;
    note: string;
    sharedData: boolean;
}

interface IAppointment extends Document {
    _id: string;
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
    services: string[];
    rejectReason?: string;
    transferNotes?: ITransferNote[];
    isContinuousCare?: boolean;
    isDoctorAssignedByPatient?: boolean;
    patientHistory?: string[];
    meetingCode?: string;
}

const transferNoteSchema = new Schema<ITransferNote>({
    date: { type: Date, default: Date.now },
    fromDoctorId: { type: Schema.Types.String, ref: 'user', required: true },
    toDoctorId: { type: Schema.Types.String, ref: 'user', required: true },
    note: { type: String },
    sharedData: { type: Boolean, default: true }
});

const appointmentSchema = new Schema<IAppointment>(
    {
        _id: { type: String }, // Bỏ required: true
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
        rejectReason: { type: String },
        transferNotes: [transferNoteSchema],
        isContinuousCare: { type: Boolean, default: false },
        isDoctorAssignedByPatient: { type: Boolean, default: false },
        patientHistory: [{ type: String, ref: 'Appointment' }],
        meetingCode: { type: String }
    },
    { timestamps: true, _id: false }
);

// Middleware để sinh _id trước khi lưu
appointmentSchema.pre('save', async function (next) {
    if (this.isNew) {
        const appointmentDate = new Date(this.date);
        const day = String(appointmentDate.getDate()).padStart(2, '0');
        const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
        const year = appointmentDate.getFullYear();
        const datePrefix = `${day}${month}${year}`; // Ví dụ: 12042025

        // Đếm số lượng appointment trong ngày đó để tạo STT
        const count = await Appointment.countDocuments({
            _id: { $regex: `^${datePrefix}_` },
        });

        const sequenceNumber = String(count + 1).padStart(3, '0'); // Ví dụ: 001, 002
        this._id = `${datePrefix}_${sequenceNumber}`; // Ví dụ: 12042025_001
    }
    next();
});

const Appointment = model<IAppointment>('Appointment', appointmentSchema);

export type { IAppointment };

export default Appointment;
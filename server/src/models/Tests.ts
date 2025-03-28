// src/models/tests.ts
import { Schema, model, Document } from 'mongoose';

// interface IImageDetail {
//     url: string;           // URL của ảnh
//     description: string;   // Mô tả tình trạng của ảnh
// }
// interface ITests extends Document {
//     appointmentId: string;
//     userId: string;
//     bloodTest: string;
//     urineTest: string;
//     xRay: IImageDetail[];         // Mảng chứa URL ảnh và mô tả tình trạng cho X-quang
//     ultrasound: IImageDetail[];   // Mảng chứa URL ảnh và mô tả tình trạng cho siêu âm
//     mri: IImageDetail[];          // Mảng chứa URL ảnh và mô tả tình trạng cho MRI
//     ecg: IImageDetail[];          // Mảng chứa URL ảnh và mô tả tình trạng cho điện tâm đồ
//     createdAt: Date;
//     updatedAt: Date;
// }

// const testsSchema = new Schema<ITests>(
//     {
//         appointmentId: { type: Schema.Types.String, ref: 'Appointment', required: true },
//         userId: { type: Schema.Types.String, ref: 'user', required: true },
//         bloodTest: { type: String },
//         urineTest: { type: String },
//         xRay: [
//             {
//                 url: { type: String, required: true },
//                 description: { type: String, required: true },
//             }
//         ],           // URL và mô tả tình trạng cho ảnh X-quang
//         ultrasound: [
//             {
//                 url: { type: String, required: true },
//                 description: { type: String, required: true },
//             }
//         ],     // URL và mô tả tình trạng cho siêu âm
//         mri: [
//             {
//                 url: { type: String, required: true },
//                 description: { type: String, required: true },
//             }
//         ],            // URL và mô tả tình trạng cho MRI
//         ecg: [
//             {
//                 url: { type: String, required: true },
//                 description: { type: String, required: true },
//             }
//         ],            // URL và mô tả tình trạng cho điện tâm đồ
//     },
//     { timestamps: true }
// );
interface ITests extends Document {
    appointmentId: string;
    userId: string;
    bloodTest: string;
    urineTest: string;
    xRay: string;
    xRayImg: string[];
    ultrasound: string;
    ultrasoundImg: string[];
    mri: string;
    mriImg: string[];
    ecg: string;
    ecgImg: string[];
    createdAt: Date;
    updatedAt: Date;
}

const testsSchema = new Schema<ITests>(
    {
        appointmentId: { type: Schema.Types.String, ref: 'Appointment', required: true },
        userId: { type: Schema.Types.String, ref: 'User', required: true },
        bloodTest: { type: String },
        urineTest: { type: String },
        xRay: { type: String },
        xRayImg: { type: [String], default: [] },
        ultrasound: { type: String },
        ultrasoundImg: { type: [String], default: [] },
        mri: { type: String },
        mriImg: { type: [String], default: [] },
        ecg: { type: String },
        ecgImg: { type: [String], default: [] },
    },
    { timestamps: true }
);

const Tests = model<ITests>('Tests', testsSchema);

export default Tests;
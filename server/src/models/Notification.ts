import { Schema, model, Document } from 'mongoose';

interface INotification extends Document {
    userId: string; // Người nhận thông báo (bác sĩ trong trường hợp này)
    message: string;
    type: 'appointment' | 'system' | 'message';
    isRead: boolean;
    relatedId?: string; // ID liên quan (ví dụ: appointmentId)
}

const notificationSchema = new Schema<INotification>(
    {
        userId: { type: Schema.Types.String, ref: 'user', required: true },
        message: { type: String, required: true },
        type: { 
            type: String, 
            enum: ['appointment', 'system', 'message'], 
            default: 'appointment' 
        },
        isRead: { type: Boolean, default: false },
        relatedId: { type: Schema.Types.String }, // Có thể liên kết với appointment
    },
    { timestamps: true }
);

const Notification = model<INotification>('Notification', notificationSchema);

export default Notification;
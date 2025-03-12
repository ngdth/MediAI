import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    content: string;
    likes: mongoose.Types.ObjectId[];
    unlikes: mongoose.Types.ObjectId[];
    parentComment?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const CommentSchema = new Schema<IComment>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    unlikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' },
}, { timestamps: true });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);

import mongoose, { Schema, model, Document } from 'mongoose';

interface IBlog extends Document {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    specialization: string;
    media: { url: string, type: 'image' | 'video' }[];
    likes: Schema.Types.ObjectId[];
    unlikes: Schema.Types.ObjectId[];
    comments: {
        user: Schema.Types.ObjectId;
        content: string;
        likes: Schema.Types.ObjectId[];
        unlikes: Schema.Types.ObjectId[];
    }[];
}

const blogSchema = new Schema<IBlog>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: { type: String, required: true },
    media: [{
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], required: true }
    }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    unlikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [
        {
            user: { type: Schema.Types.ObjectId, ref: 'User' },
            content: { type: String, required: true },
            likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            unlikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        },
    ],
});

const Blog = model<IBlog>('Blog', blogSchema);

export default Blog;
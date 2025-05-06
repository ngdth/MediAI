import mongoose, { Schema, model, Document, Types } from 'mongoose';

interface IBlogCommentReply {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    content: string;
    likes: Types.ObjectId[];
    unlikes: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    reported: {
        user: Types.ObjectId;
        reason: string;
        createdAt: Date;
    }[];
}

interface IBlogComment {
    user: Types.ObjectId;
    content: string;
    likes: Types.ObjectId[];
    unlikes: Types.ObjectId[];
    replies: Types.DocumentArray<IBlogCommentReply>;
    createdAt: Date;
    updatedAt: Date;
    reported: {
        user: Types.ObjectId;
        reason: string;
        createdAt: Date;
    }[];
}

interface IBlog extends Document {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    specialization: string;
    media: { url: string, type: 'image' | 'video' }[];
    likes: Schema.Types.ObjectId[];
    unlikes: Schema.Types.ObjectId[];
    comments: Types.DocumentArray<IBlogComment>;
    visibility: 'public' | 'private' | 'doctors';
    createdAt: Date;
    updatedAt: Date;

}

const blogSchema = new Schema<IBlog>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    specialization: { type: String, required: true },
    media: [{
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], required: true }
    }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    unlikes: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    comments: [{
        user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
        content: { type: String, required: true },
        likes: [{ type: Schema.Types.ObjectId, ref: 'user' }],
        unlikes: [{ type: Schema.Types.ObjectId, ref: 'user' }],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        replies: [{
            user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
            content: { type: String },
            likes: [{ type: Schema.Types.ObjectId, ref: 'user' }],
            unlikes: [{ type: Schema.Types.ObjectId, ref: 'user' }],
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        }]
    }],
    visibility: {
        type: String,
        enum: ['public', 'private', 'doctors'],
        default: 'public'
    }
}, { timestamps: true });

const Blog = model<IBlog>('Blog', blogSchema);

export default Blog;
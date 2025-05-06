import mongoose, { Schema, Document } from "mongoose";

export interface IServicePack extends Document {
    name: string;
    description: string;
    services: mongoose.Types.ObjectId[];
    price: number;
    imageUrl: string;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

const ServicePackSchema: Schema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        services: [{ type: mongoose.Schema.Types.ObjectId, ref: "service", required: true }],
        price: { type: Number, required: true },
        imageUrl: { type: String, required: true },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true }
);

const ServicePack = mongoose.model<IServicePack>("servicePack", ServicePackSchema);

export default ServicePack;

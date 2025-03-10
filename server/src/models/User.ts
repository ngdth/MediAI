import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user" | "doctor" | "nurse" | "pharmacy";
  verified: boolean;
  active: boolean;
  favorites: mongoose.Types.ObjectId[];
}

export interface IDoctor extends IUser {
  specialization: string;
  experience: number;
}

export interface INurse extends IUser {
  specialization: string;
  experience: number;
}

export interface IPharmacy extends IUser {
  pharmacyName: string;
  location: string;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    role: { type: String, enum: ["admin", "user", "doctor", "nurse", "pharmacy"], default: "user" },
    verified: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    favorites: [{ type: mongoose.Types.ObjectId }],
  },
  { timestamps: true, discriminatorKey: "role" }
);

const User = mongoose.model<IUser>("User", UserSchema);

const DoctorSchema: Schema = new Schema(
  {
    specialization: { type: String, required: true },
    experience: { type: Number, default: 0 },
  },
);

export const Doctor = User.discriminator<IDoctor>("doctor", DoctorSchema);

const NurseSchema: Schema = new Schema(
  {
    specialization: { type: String, required: true },
    experience: { type: Number, default: 0 },
  },
);

export const Nurse = User.discriminator<INurse>("nurse", NurseSchema);

const PharmacySchema: Schema = new Schema(
  {
    pharmacyName: { type: String, required: true },
    location: { type: String, required: true },
  },
);

export const Pharmacy = User.discriminator<IPharmacy>("pharmacy", PharmacySchema);

export default User;

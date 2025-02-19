import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user" | "doctor" | "nurse";
  verified: boolean;
  favorites: mongoose.Types.ObjectId[];
}

export interface IDoctor extends IUser {
  specialization: string;
  experience: number;
}

export interface INurse extends IUser {
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    role: { type: String, enum: ["admin", "user", "doctor", "nurse"], default: "user" },
    verified: { type: Boolean, default: false },
    favorites: [{ type: mongoose.Types.ObjectId }],
  },
  { timestamps: true, discriminatorKey: "role" }
);

const User = mongoose.model<IUser>("user", UserSchema);

const DoctorSchema: Schema = new Schema(
  {
    specialization: { type: String, required: true },
    experience: { type: Number, default: 0 },
  },
);

export const Doctor = User.discriminator<IDoctor>("doctor", DoctorSchema);

const NurseSchema: Schema = new Schema(
  {
  },
);

export const Nurse = User.discriminator<INurse>("nurse", NurseSchema);

export default User;

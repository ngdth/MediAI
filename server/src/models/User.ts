import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user" | "doctor";
  verified: boolean;
  favorites: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user", "doctor"], default: "user" },
    verified: { type: Boolean, default: false },
    favorites: [{ type: mongoose.Types.ObjectId, ref: "DoctorProfile" }],
    experience: { type: Number, default: 0 },
    specialization: { type: mongoose.Types.ObjectId, ref: "Specialization" },
  },
  { timestamps: true, discriminatorKey: "roleType" }
);

const User = mongoose.model<IUser>("User", UserSchema);

const DoctorSchema: Schema = new Schema(
  {
    specialization: { type: String, required: true },
    experienceYears: { type: Number, default: 0 },
  },
);

export const Doctor = User.discriminator("Doctor", DoctorSchema);
export default User;

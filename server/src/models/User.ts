import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  imageUrl?: string;
  googleId?: string;
  birthday: Date;
  gender: 'Nam' | 'Nữ';
  phone: string;
  address: string;
  city: string;
  country: string;
  bio: string;
  role: "admin" | "user" | "doctor" | "nurse" | "pharmacy" | "head of department";
  verified: boolean;
  active: boolean;
  favorites?: mongoose.Types.ObjectId[];
}

export interface IDoctor extends IUser {
  specialization: string;
  experience: number;
}

export interface IHeadOfDepartment extends IUser {
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
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    imageUrl: { type: String, default: "" },
    googleId: { type: String, unique: true, sparse: true },   // support google login
    role: { type: String, enum: ["admin", "user", "doctor", "nurse", "pharmacy", "head of department"], default: "user" },
    verified: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    favorites: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    firstName: { type: String },
    lastName: { type: String },
    birthday: { type: Date },
    gender: { type: String, enum: ['Nam', 'Nữ'] },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    bio: { type: String },
  },
  { timestamps: true, discriminatorKey: 'role' }
);

const User = mongoose.model<IUser>('user', UserSchema);

const DoctorSchema: Schema = new Schema(
  {
    specialization: { type: String, required: true },
    experience: { type: Number, default: 0 },
  },
);

export const Doctor = User.discriminator<IDoctor>('doctor', DoctorSchema);

const NurseSchema: Schema = new Schema(
  {
    specialization: { type: String, required: true },
    experience: { type: Number, default: 0 },
  },
);

export const Nurse = User.discriminator<INurse>('nurse', NurseSchema);

const PharmacySchema: Schema = new Schema(
  {
    pharmacyName: { type: String, required: true },
    location: { type: String, required: true },
  },
);

export const Pharmacy = User.discriminator<IPharmacy>('pharmacy', PharmacySchema);

const HeadOfDepartmentSchema: Schema = new Schema(
  {
    specialization: { type: String, required: true },
    experience: { type: Number, default: 0 },
  },
);

export const HeadOfDepartment = User.discriminator<IHeadOfDepartment>('head of department', HeadOfDepartmentSchema);

export default User;

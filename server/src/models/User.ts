import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
<<<<<<< duong
  password: string;
  role: "admin" | "user" | "doctor" | "nurse" | "pharmacy";
  verified: boolean;
  active: boolean;
  favorites: mongoose.Types.ObjectId[];
=======
  password?: string;
  birthday: Date;
  phone: string;
  gender: 'Nam' | 'Nữ';
  imageUrl?: string;
  googleId?: string;
  role: 'admin' | 'user' | 'doctor' | 'nurse' | 'pharmacy';
  verified: boolean;
  active: boolean;
  address: string;
  city: string;
  country: string;
  favorites?: mongoose.Types.ObjectId[];
>>>>>>> local
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
<<<<<<< duong
    password: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    role: { type: String, enum: ["admin", "user", "doctor", "nurse", "pharmacy"], default: "user" },
    verified: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    favorites: [{ type: mongoose.Types.ObjectId }],
=======
    password: { type: String },
    imageUrl: { type: String, default: '' },
    googleId: { type: String, unique: true, sparse: true },   // support google login
    role: { type: String, enum: ['admin', 'user', 'doctor', 'nurse', 'pharmacy'], default: 'user' },
    verified: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    favorites: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    firstname: { type: String,  },
    lastname: { type: String,  },
    birthday: { type: Date,  },
    phone: { type: String, required: true },
    gender: { type: String, enum: ['Nam', 'Nữ'], required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
>>>>>>> local
  },
  { timestamps: true, discriminatorKey: 'role' }
);

const User = mongoose.model<IUser>('User', UserSchema);

const DoctorSchema: Schema = new Schema(
  {
    specialization: { type: String, required: true },
    experience: { type: Number, default: 0 },
  },
);

export const Doctor = User.discriminator<IDoctor>('Doctor', DoctorSchema);

const NurseSchema: Schema = new Schema(
  {
    specialization: { type: String, required: true },
    experience: { type: Number, default: 0 },
  },
);

export const Nurse = User.discriminator<INurse>('Nurse', NurseSchema);

const PharmacySchema: Schema = new Schema(
  {
    pharmacyName: { type: String, required: true },
    location: { type: String, required: true },
  },
);

export const Pharmacy = User.discriminator<IPharmacy>('Pharmacy', PharmacySchema);

export default User;

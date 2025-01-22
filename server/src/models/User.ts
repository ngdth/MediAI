import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  verified: boolean;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);

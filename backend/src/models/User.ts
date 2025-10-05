import { Schema, model, Document } from 'mongoose';

// Define the possible roles for a user
export enum UserRole {
  INSTITUTE = 'Institute',
  INDIVIDUAL = 'Individual',
}

// Define the interface for the User document for TypeScript
export interface IUser extends Document {
  address: string;
  role: UserRole;
  ensName?: string;
  lastLoginAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      default: UserRole.INDIVIDUAL,
    },
    ensName: {
      type: String,
      required: false,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const User = model<IUser>('User', userSchema);

export default User;
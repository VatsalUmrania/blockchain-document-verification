import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  address: string;
  ensName?: string;
  lastLoginAt: Date;
  createdAt: Date;
  nonce: string;
}

const userSchema = new Schema<IUser>({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  ensName: {
    type: String,
    trim: true
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  nonce: {
    type: String,
    required: true
  }
});

export const User = mongoose.model<IUser>('User', userSchema);

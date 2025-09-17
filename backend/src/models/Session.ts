import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  userId: string;
  nonce: string;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>({
  userId: {
    type: String,
    required: true
  },
  nonce: {
    type: String,
    required: true,
    unique: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Session = mongoose.model<ISession>('Session', sessionSchema);

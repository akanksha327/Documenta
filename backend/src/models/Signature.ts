import mongoose, { Schema, Document } from 'mongoose';

export interface ISignature extends Document {
  documentId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'signature' | 'name' | 'date';
  value?: string;
  fontFamily?: string;
  isSigned?: boolean;
  signatureHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SignatureSchema = new Schema<ISignature>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    page: { type: Number, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    type: { type: String, enum: ['signature', 'name', 'date'], required: true },
    value: { type: String, default: '' },
    fontFamily: { type: String, default: '' },
    isSigned: { type: Boolean, default: false },
    signatureHash: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const SignatureModel = mongoose.models.Signature || mongoose.model<ISignature>('Signature', SignatureSchema);

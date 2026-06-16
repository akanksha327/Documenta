import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  ownerId: mongoose.Types.ObjectId | string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  status: 'Draft' | 'Pending' | 'Signed' | 'Rejected';
  fileUrl: string;
  sharedCount: number;
  shareToken?: string | null;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Pending', 'Signed', 'Rejected'],
      default: 'Draft',
      index: true,
    },
    fileUrl: { type: String, required: true },
    sharedCount: { type: Number, default: 0 },
    shareToken: { type: String, default: null },
    uploadedAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

export const DocumentModel = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

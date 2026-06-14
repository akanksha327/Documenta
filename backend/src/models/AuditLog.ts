import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  documentId: mongoose.Types.ObjectId | string;
  userId?: mongoose.Types.ObjectId | string | null;
  userName?: string | null;
  action: string;
  device?: string | null;
  ipAddress?: string | null;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    userName: { type: String, default: null },
    action: { type: String, required: true },
    device: { type: String, default: null },
    ipAddress: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  }
);

export const AuditLogModel = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

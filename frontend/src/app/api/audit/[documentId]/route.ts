import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth-middleware';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import AuditLog from '@/models/AuditLog';

export async function GET(req: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  const user = await verifyAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    await dbConnect();
    const { documentId } = await params;

    const doc = await Document.findById(documentId);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (doc.ownerId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized to access audit logs' }, { status: 403 });
    }

    const logs = await AuditLog.find({ documentId }).sort({ createdAt: -1 });

    const mappedLogs = logs.map((log) => ({
      id: log._id.toString(),
      documentId: log.documentId.toString(),
      userId: log.userId ? log.userId.toString() : null,
      userName: log.userName,
      action: log.action,
      device: log.device,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json(mappedLogs);
  } catch (error: any) {
    console.error('GET /api/audit/[documentId] error:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit logs' }, { status: 500 });
  }
}

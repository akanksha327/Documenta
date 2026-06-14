import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth-middleware';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import AuditLog from '@/models/AuditLog';

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    await dbConnect();
    
    const userDocs = await Document.find({ ownerId: user.userId }).select('_id originalName');
    const docIds = userDocs.map((doc) => doc._id);

    const logs = await AuditLog.find({ documentId: { $in: docIds } })
      .sort({ createdAt: -1 });

    const docMap = new Map(userDocs.map((doc) => [doc._id.toString(), doc.originalName]));

    const mappedLogs = logs.map((log) => {
      const docIdStr = log.documentId.toString();
      return {
        id: log._id.toString(),
        documentId: docIdStr,
        userId: log.userId ? log.userId.toString() : null,
        userName: log.userName,
        action: log.action,
        device: log.device,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt.toISOString(),
        document: {
          originalName: docMap.get(docIdStr) || 'Unknown Document',
        },
      };
    });

    return NextResponse.json(mappedLogs);
  } catch (error: any) {
    console.error('GET /api/audit error:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit logs' }, { status: 500 });
  }
}

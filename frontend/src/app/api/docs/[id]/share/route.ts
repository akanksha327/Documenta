import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth-middleware';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import AuditLog from '@/models/AuditLog';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    await dbConnect();
    const { id } = await params;

    const doc = await Document.findById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (doc.ownerId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized to share this document' }, { status: 403 });
    }

    const token = doc.shareToken || `${id}-share-${Date.now()}`;
    
    const updated = await Document.findByIdAndUpdate(
      id,
      {
        shareToken: token,
        $inc: { sharedCount: 1 },
      },
      { new: true }
    );

    const ipAddress = req.headers.get('x-forwarded-for') || null;
    const device = req.headers.get('user-agent') || null;

    await AuditLog.create({
      documentId: id,
      userId: user.userId,
      userName: user.name,
      action: 'Generated shareable signing link',
      device,
      ipAddress,
    });

    const mappedDoc = {
      id: updated._id.toString(),
      ownerId: updated.ownerId.toString(),
      fileName: updated.fileName,
      originalName: updated.originalName,
      fileSize: updated.fileSize,
      fileType: updated.fileType,
      status: updated.status,
      fileUrl: updated.fileUrl,
      uploadedAt: updated.uploadedAt.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      sharedCount: updated.sharedCount,
      shareToken: updated.shareToken,
    };

    return NextResponse.json(mappedDoc);
  } catch (error: any) {
    console.error('PUT /api/docs/[id]/share error:', error);
    return NextResponse.json({ error: 'Failed to share document' }, { status: 500 });
  }
}

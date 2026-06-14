import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth-middleware';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import Signature from '@/models/Signature';
import AuditLog from '@/models/AuditLog';

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    await dbConnect();
    const { documentId, signatures } = await req.json();

    if (!documentId || !Array.isArray(signatures)) {
      return NextResponse.json({ error: 'documentId and signatures array are required' }, { status: 400 });
    }

    const doc = await Document.findById(documentId);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (doc.ownerId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized to access this document' }, { status: 403 });
    }

    // Delete existing signatures for this document
    await Signature.deleteMany({ documentId });

    // Create the new ones
    const createdSignatures = [];
    for (const sig of signatures) {
      const created = await Signature.create({
        documentId,
        userId: user.userId,
        page: parseInt(sig.page),
        x: parseFloat(sig.x),
        y: parseFloat(sig.y),
        width: parseFloat(sig.width),
        height: parseFloat(sig.height),
        type: sig.type,
      });
      createdSignatures.push({
        id: created._id.toString(),
        documentId: created.documentId.toString(),
        userId: created.userId.toString(),
        page: created.page,
        x: created.x,
        y: created.y,
        width: created.width,
        height: created.height,
        type: created.type,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      });
    }

    const ipAddress = req.headers.get('x-forwarded-for') || null;
    const device = req.headers.get('user-agent') || null;

    await AuditLog.create({
      documentId,
      userId: user.userId,
      userName: user.name,
      action: `Saved changes: placed ${signatures.length} element(s) total`,
      device,
      ipAddress,
    });

    return NextResponse.json(createdSignatures);
  } catch (error: any) {
    console.error('POST /api/signatures/bulk error:', error);
    return NextResponse.json({ error: 'Failed to bulk save signature fields' }, { status: 500 });
  }
}

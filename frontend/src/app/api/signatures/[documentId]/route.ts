import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth-middleware';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import Signature from '@/models/Signature';

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
      return NextResponse.json({ error: 'Unauthorized to view signatures for this document' }, { status: 403 });
    }

    const signatures = await Signature.find({ documentId }).sort({ createdAt: 1 });
    
    const mappedSigs = signatures.map((sig) => ({
      id: sig._id.toString(),
      documentId: sig.documentId.toString(),
      userId: sig.userId.toString(),
      page: sig.page,
      x: sig.x,
      y: sig.y,
      width: sig.width,
      height: sig.height,
      type: sig.type,
      createdAt: sig.createdAt.toISOString(),
      updatedAt: sig.updatedAt.toISOString(),
    }));

    return NextResponse.json(mappedSigs);
  } catch (error: any) {
    console.error('GET /api/signatures/[documentId] error:', error);
    return NextResponse.json({ error: 'Failed to retrieve signature fields' }, { status: 500 });
  }
}

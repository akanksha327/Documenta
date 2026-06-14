import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth-middleware';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      return NextResponse.json({ error: 'Unauthorized to view this document' }, { status: 403 });
    }

    const mappedDoc = {
      id: doc._id.toString(),
      ownerId: doc.ownerId.toString(),
      fileName: doc.fileName,
      originalName: doc.originalName,
      fileSize: doc.fileSize,
      fileType: doc.fileType,
      status: doc.status,
      fileUrl: doc.fileUrl,
      uploadedAt: doc.uploadedAt.toISOString(),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      sharedCount: doc.sharedCount,
      shareToken: doc.shareToken,
    };

    return NextResponse.json(mappedDoc);
  } catch (error: any) {
    console.error('GET /api/docs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to retrieve document details' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      return NextResponse.json({ error: 'Unauthorized to delete this document' }, { status: 403 });
    }

    await Document.findByIdAndDelete(id);

    if (doc.fileName !== 'sample.pdf') {
      const filePath = path.join(process.cwd(), 'public/uploads', doc.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/docs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}

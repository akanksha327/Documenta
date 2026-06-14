import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth-middleware';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import AuditLog from '@/models/AuditLog';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    const query: any = { ownerId: user.userId };
    if (status && status !== 'All') {
      query.status = status;
    }
    if (search) {
      query.originalName = { $regex: search, $options: 'i' };
    }

    const docs = await Document.find(query).sort({ uploadedAt: -1 });
    
    const mappedDocs = docs.map((doc) => ({
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
    }));

    return NextResponse.json(mappedDocs);
  } catch (error: any) {
    console.error('GET /api/docs error:', error);
    return NextResponse.json({ error: 'Failed to retrieve documents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    await dbConnect();
    const data = await req.formData();
    const file = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'Please upload a PDF file' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = `${uniqueSuffix}-${sanitizedName}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    const doc = await Document.create({
      ownerId: user.userId,
      fileName: filename,
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl: `/uploads/${filename}`,
      status: 'Draft',
    });

    const ipAddress = req.headers.get('x-forwarded-for') || null;
    const device = req.headers.get('user-agent') || null;

    await AuditLog.create({
      documentId: doc._id,
      userId: user.userId,
      userName: user.name,
      action: 'Document uploaded',
      device,
      ipAddress,
    });

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error('POST /api/docs error:', error);
    return NextResponse.json({ error: 'Failed to process document upload' }, { status: 500 });
  }
}

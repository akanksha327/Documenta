import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth-middleware';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    await dbConnect();
    const ownerId = user.userId;

    const totalDocuments = await Document.countDocuments({ ownerId });
    const pendingDocuments = await Document.countDocuments({ ownerId, status: 'Pending' });
    const signedDocuments = await Document.countDocuments({ ownerId, status: 'Signed' });

    const sharedResult = await Document.aggregate([
      { $match: { ownerId: new mongoose.Types.ObjectId(ownerId) } },
      { $group: { _id: null, totalShared: { $sum: '$sharedCount' } } }
    ]);
    const sharedLinks = sharedResult.length > 0 ? sharedResult[0].totalShared : 0;

    const recentDocs = await Document.find({ ownerId })
      .sort({ uploadedAt: -1 })
      .limit(10);

    const mappedRecent = recentDocs.map((doc) => ({
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
      title: doc.originalName,
    }));

    return NextResponse.json({
      user,
      stats: {
        total: totalDocuments,
        pending: pendingDocuments,
        signed: signedDocuments,
        sharedLinks,
      },
      recentDocuments: mappedRecent,
    });
  } catch (error: any) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve session statistics' }, { status: 500 });
  }
}

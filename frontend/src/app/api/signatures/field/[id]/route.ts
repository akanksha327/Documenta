import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth-middleware';
import dbConnect from '@/lib/db';
import Signature from '@/models/Signature';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    await dbConnect();
    const { id } = await params;

    const signature = await Signature.findById(id);
    if (!signature) {
      return NextResponse.json({ error: 'Signature field not found' }, { status: 404 });
    }

    const mappedSig = {
      id: signature._id.toString(),
      documentId: signature.documentId.toString(),
      userId: signature.userId.toString(),
      page: signature.page,
      x: signature.x,
      y: signature.y,
      width: signature.width,
      height: signature.height,
      type: signature.type,
      createdAt: signature.createdAt.toISOString(),
      updatedAt: signature.updatedAt.toISOString(),
    };

    return NextResponse.json(mappedSig);
  } catch (error: any) {
    console.error('GET /api/signatures/field/[id] error:', error);
    return NextResponse.json({ error: 'Failed to retrieve signature field' }, { status: 500 });
  }
}

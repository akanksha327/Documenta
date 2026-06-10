import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/sessions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const session = getSession(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    const totalDocuments = await db.document.count({
      where: { userId: session.userId },
    });

    const pendingDocuments = await db.document.count({
      where: { userId: session.userId, status: 'pending' },
    });

    const signedDocuments = await db.document.count({
      where: { userId: session.userId, status: 'signed' },
    });

    const recentDocuments = await db.document.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      user: session,
      stats: {
        total: totalDocuments,
        pending: pendingDocuments,
        signed: signedDocuments,
      },
      recentDocuments,
    });
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getSession, invalidateSession } from '@/lib/sessions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (token && getSession(token)) {
      invalidateSession(token);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

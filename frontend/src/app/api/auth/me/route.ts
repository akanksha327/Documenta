import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return unauthorizedResponse();
  }

  return NextResponse.json({
    id: user.userId,
    name: user.name,
    email: user.email,
  });
}

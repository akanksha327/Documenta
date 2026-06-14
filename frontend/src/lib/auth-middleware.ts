import { NextRequest, NextResponse } from 'next/server';
import dbConnect from './db';
import User from '@/models/User';
import { verifyToken } from './jwt';

export interface AuthenticatedUser {
  userId: string;
  name: string;
  email: string;
}

export async function verifyAuth(req: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = req.headers.get('authorization');
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      const { searchParams } = new URL(req.url);
      token = searchParams.get('token') || '';
    }

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return null;
    }

    await dbConnect();
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return null;
    }

    return {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: 'Unauthorized', message: 'Unauthorized' },
    { status: 401 }
  );
}

import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = hashPassword(password);

    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    // Seed some sample documents for the new user
    await db.document.createMany({
      data: [
        { title: 'Employment Agreement - Q3 2026', status: 'signed', userId: user.id },
        { title: 'Non-Disclosure Agreement', status: 'pending', userId: user.id },
        { title: 'Vendor Service Contract', status: 'pending', userId: user.id },
        { title: 'Leave Policy Acknowledgment', status: 'signed', userId: user.id },
        { title: 'Project Scope Amendment', status: 'draft', userId: user.id },
        { title: 'Client Onboarding Checklist', status: 'pending', userId: user.id },
      ],
    });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

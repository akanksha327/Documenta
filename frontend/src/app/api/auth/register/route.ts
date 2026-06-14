import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Document from '@/models/Document';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Seed some sample documents for the new user
    await Document.create([
      { fileName: 'sample.pdf', originalName: 'Employment Agreement - Q3 2026.pdf', fileSize: 102400, fileType: 'application/pdf', status: 'Signed', fileUrl: '/uploads/sample.pdf', ownerId: user._id },
      { fileName: 'sample.pdf', originalName: 'Non-Disclosure Agreement.pdf', fileSize: 85600, fileType: 'application/pdf', status: 'Pending', fileUrl: '/uploads/sample.pdf', ownerId: user._id },
      { fileName: 'sample.pdf', originalName: 'Vendor Service Contract.pdf', fileSize: 142000, fileType: 'application/pdf', status: 'Pending', fileUrl: '/uploads/sample.pdf', ownerId: user._id },
      { fileName: 'sample.pdf', originalName: 'Leave Policy Acknowledgment.pdf', fileSize: 51200, fileType: 'application/pdf', status: 'Signed', fileUrl: '/uploads/sample.pdf', ownerId: user._id },
      { fileName: 'sample.pdf', originalName: 'Project Scope Amendment.pdf', fileSize: 64000, fileType: 'application/pdf', status: 'Draft', fileUrl: '/uploads/sample.pdf', ownerId: user._id },
      { fileName: 'sample.pdf', originalName: 'Client Onboarding Checklist.pdf', fileSize: 38400, fileType: 'application/pdf', status: 'Rejected', fileUrl: '/uploads/sample.pdf', ownerId: user._id },
    ]);

    return NextResponse.json({
      success: true,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

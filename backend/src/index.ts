import express from 'express';
import cors from 'cors';
import { createHash } from 'crypto';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './lib/db.js';
import { createSession, getSession, invalidateSession } from './lib/sessions.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Setup Uploads Directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Write a dummy sample PDF for seeded documents if it doesn't exist
const samplePdfPath = path.join(uploadDir, 'sample.pdf');
if (!fs.existsSync(samplePdfPath)) {
  // A minimal valid PDF structure
  const minimalPdf = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 40 >>\nstream\nBT /F1 24 Tf 100 700 Td (SignFlow Sample PDF) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n301\n%%EOF\n'
  );
  fs.writeFileSync(samplePdfPath, minimalPdf);
}

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());

// Serve uploads folder statically
app.use('/uploads', express.static(uploadDir));

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// Multer Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Remove spaces and special chars from filename
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Authentication Middleware
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const session = getSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired' });
  }

  req.user = session; // Contains userId, name, email
  next();
}

async function logAuditEvent(documentId: string, userId: string | null, userName: string | null, action: string, req: express.Request) {
  try {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
    const device = req.headers['user-agent'] || null;
    await db.auditLog.create({
      data: {
        documentId,
        userId,
        userName,
        action,
        device,
        ipAddress,
      }
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ message: "Hello, world!" });
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = hashPassword(password);

    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    // Seed some sample documents for the new user matching the new schema
    await db.document.createMany({
      data: [
        { fileName: 'sample.pdf', originalName: 'Employment Agreement - Q3 2026.pdf', fileSize: 102400, fileType: 'application/pdf', status: 'Signed', fileUrl: '/uploads/sample.pdf', ownerId: user.id },
        { fileName: 'sample.pdf', originalName: 'Non-Disclosure Agreement.pdf', fileSize: 85600, fileType: 'application/pdf', status: 'Pending', fileUrl: '/uploads/sample.pdf', ownerId: user.id },
        { fileName: 'sample.pdf', originalName: 'Vendor Service Contract.pdf', fileSize: 142000, fileType: 'application/pdf', status: 'Pending', fileUrl: '/uploads/sample.pdf', ownerId: user.id },
        { fileName: 'sample.pdf', originalName: 'Leave Policy Acknowledgment.pdf', fileSize: 51200, fileType: 'application/pdf', status: 'Signed', fileUrl: '/uploads/sample.pdf', ownerId: user.id },
        { fileName: 'sample.pdf', originalName: 'Project Scope Amendment.pdf', fileSize: 64000, fileType: 'application/pdf', status: 'Draft', fileUrl: '/uploads/sample.pdf', ownerId: user.id },
        { fileName: 'sample.pdf', originalName: 'Client Onboarding Checklist.pdf', fileSize: 38400, fileType: 'application/pdf', status: 'Rejected', fileUrl: '/uploads/sample.pdf', ownerId: user.id },
      ],
    });

    res.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const hashedPassword = hashPassword(password);

    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create a simple session token
    const token = `${user.id}-${Date.now()}`;
    createSession(token, {
      userId: user.id,
      name: user.name,
      email: user.email,
    });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { token } = req.body;

    if (token && getSession(token)) {
      invalidateSession(token);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /api/auth/session
app.get('/api/auth/session', async (req, res) => {
  try {
    const token = req.query.token as string;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const session = getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Session expired' });
    }

    const totalDocuments = await db.document.count({
      where: { ownerId: session.userId },
    });

    const pendingDocuments = await db.document.count({
      where: { ownerId: session.userId, status: 'Pending' },
    });

    const signedDocuments = await db.document.count({
      where: { ownerId: session.userId, status: 'Signed' },
    });

    const sharedResult = await db.document.aggregate({
      where: { ownerId: session.userId },
      _sum: {
        sharedCount: true,
      },
    });
    const sharedLinks = sharedResult._sum.sharedCount || 0;

    const recentDocuments = await db.document.findMany({
      where: { ownerId: session.userId },
      orderBy: { uploadedAt: 'desc' },
      take: 10,
    });

    res.json({
      user: session,
      stats: {
        total: totalDocuments,
        pending: pendingDocuments,
        signed: signedDocuments,
        sharedLinks,
      },
      recentDocuments,
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /api/docs - Retrieve list with search/filter
app.get('/api/docs', authenticate, async (req: any, res) => {
  try {
    const { status, search } = req.query;
    const ownerId = req.user.userId;

    const whereClause: any = {
      ownerId,
    };

    if (status && status !== 'All') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.originalName = {
        contains: search,
      };
    }

    const docs = await db.document.findMany({
      where: whereClause,
      orderBy: { uploadedAt: 'desc' },
    });

    res.json(docs);
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

// GET /api/docs/:id - Retrieve single details
app.get('/api/docs/:id', authenticate, async (req: any, res) => {
  try {
    const doc = await db.document.findUnique({
      where: { id: req.params.id },
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (doc.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to view this document' });
    }

    res.json(doc);
  } catch (error) {
    console.error('Fetch document detail error:', error);
    res.status(500).json({ error: 'Failed to retrieve document details' });
  }
});

// PUT /api/docs/:id/share - Generate share link and track stats
app.put('/api/docs/:id/share', authenticate, async (req: any, res) => {
  try {
    const id = req.params.id;
    const document = await db.document.findUnique({
      where: { id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to share this document' });
    }

    // Generate token if it doesn't already exist
    const token = document.shareToken || `${id}-share-${Date.now()}`;
    const updated = await db.document.update({
      where: { id },
      data: {
        shareToken: token,
        sharedCount: {
          increment: 1,
        },
      },
    });

    await logAuditEvent(id, req.user.userId, req.user.name, 'Generated shareable signing link', req);

    res.json(updated);
  } catch (error) {
    console.error('Share document error:', error);
    res.status(500).json({ error: 'Failed to share document' });
  }
});

// POST /api/docs/upload - Handle file upload
app.post('/api/docs/upload', authenticate, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const doc = await db.document.create({
      data: {
        ownerId: req.user.userId,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        fileUrl: `/uploads/${req.file.filename}`,
        status: 'Draft',
      }
    });

    await logAuditEvent(doc.id, req.user.userId, req.user.name, 'Document uploaded', req);

    res.json(doc);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process document upload' });
  }
});

// DELETE /api/docs/:id - Delete record and filesystem file
app.delete('/api/docs/:id', authenticate, async (req: any, res) => {
  try {
    const doc = await db.document.findUnique({
      where: { id: req.params.id },
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (doc.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this document' });
    }

    // Delete record from DB
    await db.document.delete({
      where: { id: req.params.id },
    });

    // Delete local physical file if it exists and is not the seeded sample.pdf
    if (doc.fileName !== 'sample.pdf') {
      const filePath = path.join(uploadDir, doc.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// GET /api/signatures/:documentId - Get all signatures for a document
app.get('/api/signatures/:documentId', authenticate, async (req: any, res) => {
  try {
    const documentId = req.params.documentId;
    const document = await db.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to access this document' });
    }

    const signatures = await db.signature.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
    });

    res.json(signatures);
  } catch (error) {
    console.error('Fetch signatures error:', error);
    res.status(500).json({ error: 'Failed to retrieve signature fields' });
  }
});

// GET /api/signatures/field/:id - Get a single signature field details
app.get('/api/signatures/field/:id', authenticate, async (req: any, res) => {
  try {
    const signature = await db.signature.findUnique({
      where: { id: req.params.id },
    });

    if (!signature) {
      return res.status(404).json({ error: 'Signature field not found' });
    }

    res.json(signature);
  } catch (error) {
    console.error('Fetch single signature error:', error);
    res.status(500).json({ error: 'Failed to retrieve signature field' });
  }
});

// POST /api/signatures - Create a signature field
app.post('/api/signatures', authenticate, async (req: any, res) => {
  try {
    const { documentId, page, x, y, width, height, type } = req.body;

    if (!documentId || page === undefined || x === undefined || y === undefined || width === undefined || height === undefined || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const document = await db.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to access this document' });
    }

    const signature = await db.signature.create({
      data: {
        documentId,
        userId: req.user.userId,
        page: parseInt(page),
        x: parseFloat(x),
        y: parseFloat(y),
        width: parseFloat(width),
        height: parseFloat(height),
        type,
      },
    });

    await logAuditEvent(documentId, req.user.userId, req.user.name, `Placed ${type} placeholder on page ${page}`, req);

    res.status(201).json(signature);
  } catch (error) {
    console.error('Create signature error:', error);
    res.status(500).json({ error: 'Failed to create signature field' });
  }
});

// PUT /api/signatures/:id - Update a signature field
app.put('/api/signatures/:id', authenticate, async (req: any, res) => {
  try {
    const id = req.params.id;
    const { page, x, y, width, height } = req.body;

    const signature = await db.signature.findUnique({
      where: { id },
    });

    if (!signature) {
      return res.status(404).json({ error: 'Signature field not found' });
    }

    if (signature.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to modify this field' });
    }

    const updated = await db.signature.update({
      where: { id },
      data: {
        page: page !== undefined ? parseInt(page) : undefined,
        x: x !== undefined ? parseFloat(x) : undefined,
        y: y !== undefined ? parseFloat(y) : undefined,
        width: width !== undefined ? parseFloat(width) : undefined,
        height: height !== undefined ? parseFloat(height) : undefined,
      },
    });

    await logAuditEvent(signature.documentId, req.user.userId, req.user.name, `Repositioned ${signature.type} placeholder on page ${updated.page}`, req);

    res.json(updated);
  } catch (error) {
    console.error('Update signature error:', error);
    res.status(500).json({ error: 'Failed to update signature field' });
  }
});

// DELETE /api/signatures/:id - Delete a signature field
app.delete('/api/signatures/:id', authenticate, async (req: any, res) => {
  try {
    const id = req.params.id;
    const signature = await db.signature.findUnique({
      where: { id },
    });

    if (!signature) {
      return res.status(404).json({ error: 'Signature field not found' });
    }

    if (signature.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this field' });
    }

    await db.signature.delete({
      where: { id },
    });

    await logAuditEvent(signature.documentId, req.user.userId, req.user.name, `Removed ${signature.type} placeholder from page ${signature.page}`, req);

    res.json({ success: true, message: 'Signature field deleted successfully' });
  } catch (error) {
    console.error('Delete signature error:', error);
    res.status(500).json({ error: 'Failed to delete signature field' });
  }
});

// POST /api/signatures/bulk - Bulk save signature fields (sync state)
app.post('/api/signatures/bulk', authenticate, async (req: any, res) => {
  try {
    const { documentId, signatures } = req.body;

    if (!documentId || !Array.isArray(signatures)) {
      return res.status(400).json({ error: 'documentId and signatures array are required' });
    }

    const document = await db.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to access this document' });
    }

    // Delete existing signatures for this document
    await db.signature.deleteMany({
      where: { documentId },
    });

    // Create the new ones
    const createdSignatures = [];
    for (const sig of signatures) {
      const created = await db.signature.create({
        data: {
          documentId,
          userId: req.user.userId,
          page: parseInt(sig.page),
          x: parseFloat(sig.x),
          y: parseFloat(sig.y),
          width: parseFloat(sig.width),
          height: parseFloat(sig.height),
          type: sig.type,
        },
      });
      createdSignatures.push(created);
    }

    await logAuditEvent(documentId, req.user.userId, req.user.name, `Saved changes: placed ${signatures.length} element(s) total`, req);

    res.json(createdSignatures);
  } catch (error) {
    console.error('Bulk save signatures error:', error);
    res.status(500).json({ error: 'Failed to bulk save signature fields' });
  }
});

// GET /api/auth/profile
app.get('/api/auth/profile', authenticate, async (req: any, res) => {
  res.json({ user: req.user });
});

// GET /api/audit - Get all audit logs across all documents owned by the user
app.get('/api/audit', authenticate, async (req: any, res) => {
  try {
    const logs = await db.auditLog.findMany({
      where: {
        document: {
          ownerId: req.user.userId,
        },
      },
      include: {
        document: {
          select: {
            originalName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(logs);
  } catch (error) {
    console.error('Fetch all audit logs error:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

// GET /api/audit/:documentId - Get all audit logs for a document
app.get('/api/audit/:documentId', authenticate, async (req: any, res) => {
  try {
    const documentId = req.params.documentId;
    const document = await db.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to access audit logs' });
    }

    const logs = await db.auditLog.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(logs);
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

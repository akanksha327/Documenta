import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dbConnect } from './lib/db.js';
import { generateToken, verifyToken } from './lib/jwt.js';
import { User } from './models/User.js';
import { DocumentModel } from './models/Document.js';
import { SignatureModel } from './models/Signature.js';
import { AuditLogModel } from './models/AuditLog.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
await dbConnect();

// Setup Uploads Directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Write a seeded sample PDF if it doesn't exist
const samplePdfPath = path.join(uploadDir, 'sample.pdf');
if (!fs.existsSync(samplePdfPath)) {
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
  maxAge: 86400, // Cache preflight OPTIONS response for 24 hours
}));

app.use(express.json());

// Serve uploads folder statically
app.use('/uploads', express.static(uploadDir));

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
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
async function authenticate(req: any, res: any, next: any) {
  try {
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

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Session expired or invalid token' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    };
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
}

// Audit Logging Helper
async function logAuditEvent(documentId: string, userId: string | null, userName: string | null, action: string, req: express.Request) {
  try {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
    const device = req.headers['user-agent'] || null;
    await AuditLogModel.create({
      documentId,
      userId,
      userName,
      action,
      device,
      ipAddress,
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

// Health check
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

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Seed sample documents
    await DocumentModel.create([
      { fileName: 'sample.pdf', originalName: 'Employment Agreement - Q3 2026.pdf', fileSize: 102400, fileType: 'application/pdf', status: 'Signed', fileUrl: '/uploads/sample.pdf', ownerId: user._id },
      { fileName: 'sample.pdf', originalName: 'Non-Disclosure Agreement.pdf', fileSize: 85600, fileType: 'application/pdf', status: 'Pending', fileUrl: '/uploads/sample.pdf', ownerId: user._id },
      { fileName: 'sample.pdf', originalName: 'Vendor Service Contract.pdf', fileSize: 142000, fileType: 'application/pdf', status: 'Pending', fileUrl: '/uploads/sample.pdf', ownerId: user._id },
      { fileName: 'sample.pdf', originalName: 'Leave Policy Acknowledgment.pdf', fileSize: 51200, fileType: 'application/pdf', status: 'Signed', fileUrl: '/uploads/sample.pdf', ownerId: user._id },
      { fileName: 'sample.pdf', originalName: 'Project Scope Amendment.pdf', fileSize: 64000, fileType: 'application/pdf', status: 'Draft', fileUrl: '/uploads/sample.pdf', ownerId: user._id },
      { fileName: 'sample.pdf', originalName: 'Client Onboarding Checklist.pdf', fileSize: 38400, fileType: 'application/pdf', status: 'Rejected', fileUrl: '/uploads/sample.pdf', ownerId: user._id },
    ]);

    res.json({
      success: true,
      user: { id: user._id.toString(), name: user.name, email: user.email },
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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.json({
      success: true,
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', async (req, res) => {
  res.json({ success: true });
});

// GET /api/auth/session
app.get('/api/auth/session', async (req, res) => {
  try {
    const token = req.query.token as string;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Session expired' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const ownerId = user._id.toString();

    const [totalDocuments, pendingDocuments, signedDocuments, sharedResult, recentDocs] = await Promise.all([
      DocumentModel.countDocuments({ ownerId }),
      DocumentModel.countDocuments({ ownerId, status: 'Pending' }),
      DocumentModel.countDocuments({ ownerId, status: 'Signed' }),
      DocumentModel.aggregate([
        { $match: { ownerId: new mongoose.Types.ObjectId(ownerId) } },
        { $group: { _id: null, totalShared: { $sum: '$sharedCount' } } }
      ]),
      DocumentModel.find({ ownerId }).sort({ uploadedAt: -1 }).limit(10)
    ]);
    const sharedLinks = sharedResult.length > 0 ? sharedResult[0].totalShared : 0;

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

    res.json({
      user: { id: user._id.toString(), name: user.name, email: user.email },
      stats: {
        total: totalDocuments,
        pending: pendingDocuments,
        signed: signedDocuments,
        sharedLinks,
      },
      recentDocuments: mappedRecent,
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticate, async (req: any, res) => {
  res.json({
    id: req.user.userId,
    name: req.user.name,
    email: req.user.email,
  });
});

// GET /api/docs
app.get('/api/docs', authenticate, async (req: any, res) => {
  try {
    const { status, search } = req.query;
    const ownerId = req.user.userId;

    const query: any = { ownerId };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.originalName = { $regex: search as string, $options: 'i' };
    }

    const docs = await DocumentModel.find(query).sort({ uploadedAt: -1 });

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

    res.json(mappedDocs);
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

// GET /api/docs/:id
app.get('/api/docs/:id', authenticate, async (req: any, res) => {
  try {
    const doc = await DocumentModel.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (doc.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to view this document' });
    }

    const mappedDoc = {
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
    };

    res.json(mappedDoc);
  } catch (error) {
    console.error('Fetch document detail error:', error);
    res.status(500).json({ error: 'Failed to retrieve document details' });
  }
});

// PUT /api/docs/:id/share
app.put('/api/docs/:id/share', authenticate, async (req: any, res) => {
  try {
    const id = req.params.id;
    const document = await DocumentModel.findById(id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to share this document' });
    }

    const token = document.shareToken || `${id}-share-${Date.now()}`;
    const updated = await DocumentModel.findByIdAndUpdate(
      id,
      {
        shareToken: token,
        $inc: { sharedCount: 1 },
      },
      { new: true }
    );

    await logAuditEvent(id, req.user.userId, req.user.name, 'Generated shareable signing link', req);

    const mappedDoc = {
      id: updated!._id.toString(),
      ownerId: updated!.ownerId.toString(),
      fileName: updated!.fileName,
      originalName: updated!.originalName,
      fileSize: updated!.fileSize,
      fileType: updated!.fileType,
      status: updated!.status,
      fileUrl: updated!.fileUrl,
      uploadedAt: updated!.uploadedAt.toISOString(),
      createdAt: updated!.createdAt.toISOString(),
      updatedAt: updated!.updatedAt.toISOString(),
      sharedCount: updated!.sharedCount,
      shareToken: updated!.shareToken,
    };

    res.json(mappedDoc);
  } catch (error) {
    console.error('Share document error:', error);
    res.status(500).json({ error: 'Failed to share document' });
  }
});

// POST /api/docs/upload
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

    const doc = await DocumentModel.create({
      ownerId: req.user.userId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      fileUrl: `/uploads/${req.file.filename}`,
      status: 'Draft',
    });

    await logAuditEvent(doc._id.toString(), req.user.userId, req.user.name, 'Document uploaded', req);

    res.json({
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
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process document upload' });
  }
});

// DELETE /api/docs/:id
app.delete('/api/docs/:id', authenticate, async (req: any, res) => {
  try {
    const doc = await DocumentModel.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (doc.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this document' });
    }

    await Promise.all([
      DocumentModel.findByIdAndDelete(req.params.id),
      SignatureModel.deleteMany({ documentId: req.params.id }),
      AuditLogModel.deleteMany({ documentId: req.params.id }),
    ]);

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

// GET /api/signatures/:documentId
app.get('/api/signatures/:documentId', authenticate, async (req: any, res) => {
  try {
    const documentId = req.params.documentId;
    const document = await DocumentModel.findById(documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to access this document' });
    }

    const signatures = await SignatureModel.find({ documentId }).sort({ createdAt: 1 });

    const mappedSigs = signatures.map((sig) => ({
      id: sig._id.toString(),
      documentId: sig.documentId.toString(),
      userId: sig.userId.toString(),
      page: sig.page,
      x: sig.x,
      y: sig.y,
      width: sig.width,
      height: sig.height,
      type: sig.type,
      createdAt: sig.createdAt.toISOString(),
      updatedAt: sig.updatedAt.toISOString(),
    }));

    res.json(mappedSigs);
  } catch (error) {
    console.error('Fetch signatures error:', error);
    res.status(500).json({ error: 'Failed to retrieve signature fields' });
  }
});

// GET /api/signatures/field/:id
app.get('/api/signatures/field/:id', authenticate, async (req: any, res) => {
  try {
    const signature = await SignatureModel.findById(req.params.id);

    if (!signature) {
      return res.status(404).json({ error: 'Signature field not found' });
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

    res.json(mappedSig);
  } catch (error) {
    console.error('Fetch single signature error:', error);
    res.status(500).json({ error: 'Failed to retrieve signature field' });
  }
});

// POST /api/signatures/bulk
app.post('/api/signatures/bulk', authenticate, async (req: any, res) => {
  try {
    const { documentId, signatures } = req.body;

    if (!documentId || !Array.isArray(signatures)) {
      return res.status(400).json({ error: 'documentId and signatures array are required' });
    }

    const document = await DocumentModel.findById(documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to access this document' });
    }

    await SignatureModel.deleteMany({ documentId });

    const signaturesToCreate = signatures.map((sig) => ({
      documentId,
      userId: req.user.userId,
      page: parseInt(sig.page),
      x: parseFloat(sig.x),
      y: parseFloat(sig.y),
      width: parseFloat(sig.width),
      height: parseFloat(sig.height),
      type: sig.type,
    }));

    const createdSigs = await SignatureModel.insertMany(signaturesToCreate);
    const createdSignatures = createdSigs.map((created) => ({
      id: created._id.toString(),
      documentId: created.documentId.toString(),
      userId: created.userId.toString(),
      page: created.page,
      x: created.x,
      y: created.y,
      width: created.width,
      height: created.height,
      type: created.type,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    }));

    await logAuditEvent(documentId, req.user.userId, req.user.name, `Saved changes: placed ${signatures.length} element(s) total`, req);

    res.json(createdSignatures);
  } catch (error) {
    console.error('Bulk save signatures error:', error);
    res.status(500).json({ error: 'Failed to bulk save signature fields' });
  }
});

// GET /api/audit
app.get('/api/audit', authenticate, async (req: any, res) => {
  try {
    const userDocs = await DocumentModel.find({ ownerId: req.user.userId }).select('_id originalName');
    const docIds = userDocs.map((doc) => doc._id);

    const logs = await AuditLogModel.find({ documentId: { $in: docIds } })
      .sort({ createdAt: -1 });

    const docMap = new Map(userDocs.map((doc) => [doc._id.toString(), doc.originalName]));

    const mappedLogs = logs.map((log) => {
      const docIdStr = log.documentId.toString();
      return {
        id: log._id.toString(),
        documentId: docIdStr,
        userId: log.userId ? log.userId.toString() : null,
        userName: log.userName,
        action: log.action,
        device: log.device,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt.toISOString(),
        document: {
          originalName: docMap.get(docIdStr) || 'Unknown Document',
        },
      };
    });

    res.json(mappedLogs);
  } catch (error) {
    console.error('Fetch all audit logs error:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

// GET /api/audit/:documentId
app.get('/api/audit/:documentId', authenticate, async (req: any, res) => {
  try {
    const documentId = req.params.documentId;
    const document = await DocumentModel.findById(documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to access audit logs' });
    }

    const logs = await AuditLogModel.find({ documentId }).sort({ createdAt: -1 });

    const mappedLogs = logs.map((log) => ({
      id: log._id.toString(),
      documentId: log.documentId.toString(),
      userId: log.userId ? log.userId.toString() : null,
      userName: log.userName,
      action: log.action,
      device: log.device,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt.toISOString(),
    }));

    res.json(mappedLogs);
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});

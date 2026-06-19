import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dbConnect } from './src/lib/db.js';
import { DocumentModel } from './src/models/Document.js';
import { SignatureModel } from './src/models/Signature.js';
import { User } from './src/models/User.js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

await dbConnect();

const docId = '6a35584e1e1c7be6df8c5aee';

async function signPdfDocument(documentId: string) {
  const document = await DocumentModel.findById(documentId);
  if (!document) throw new Error('Document not found');

  const signatures = await SignatureModel.find({ documentId, isSigned: true });
  if (signatures.length === 0) {
    return;
  }

  // Load the original PDF file
  const originalPath = path.join(__dirname, 'uploads', document.fileName);
  if (!fs.existsSync(originalPath)) {
    throw new Error('Original PDF file not found');
  }

  const pdfBytes = fs.readFileSync(originalPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  for (const sig of signatures) {
    const pageIndex = sig.page - 1;
    if (pageIndex < 0 || pageIndex >= pages.length) {
      console.warn(`Signature page index ${sig.page} is out of bounds for PDF`);
      continue;
    }

    const page = pages[pageIndex];
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Convert percentages to absolute PDF coordinates (1 in = 72 pt)
    const x = (sig.x / 100) * pageWidth;
    const y = (1 - (sig.y + sig.height) / 100) * pageHeight;
    const width = (sig.width / 100) * pageWidth;
    const height = (sig.height / 100) * pageHeight;

    if (sig.type === 'signature') {
      if (sig.value && sig.value.startsWith('data:image/')) {
        try {
          const base64Data = sig.value.replace(/^data:image\/\w+;base64,/, '');
          const imageBytes = Buffer.from(base64Data, 'base64');
          const pngImage = await pdfDoc.embedPng(imageBytes);
          
          page.drawImage(pngImage, {
            x,
            y: y + height * 0.1,
            width,
            height: height * 0.8,
          });
        } catch (err) {
          console.error('Error embedding signature PNG image:', err);
        }
      } else if (sig.value) {
        const fontSize = Math.min(width / sig.value.length * 1.5, height * 0.6, 24);
        page.drawText(sig.value, {
          x: x + 5,
          y: y + height * 0.3,
          size: fontSize,
          font: timesItalic,
          color: rgb(0.12, 0.23, 0.54),
        });
      }
    } else if (sig.type === 'name' && sig.value) {
      const fontSize = Math.min(width / sig.value.length * 1.6, height * 0.5, 14);
      page.drawText(sig.value, {
        x: x + 5,
        y: y + height * 0.35,
        size: fontSize,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.1),
      });
    } else if (sig.type === 'date' && sig.value) {
      const fontSize = Math.min(width / sig.value.length * 1.6, height * 0.5, 12);
      page.drawText(sig.value, {
        x: x + 5,
        y: y + height * 0.35,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0.1, 0.1, 0.1),
      });
    }

    const hashText = sig.signatureHash || 'SF-VERIFIED';
    page.drawText(`Verified: ${hashText}`, {
      x: x + 5,
      y: y + 2,
      size: 5.5,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  const signedFileName = `signed-${document.fileName}`;
  const signedPath = path.join(__dirname, 'uploads', signedFileName);
  
  const signedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(signedPath, signedPdfBytes);

  document.fileName = signedFileName;
  document.fileUrl = `/uploads/${signedFileName}`;
  document.status = 'Signed';
  await document.save();
  console.log('Successfully saved document: ', document.fileName);
}

try {
  await signPdfDocument(docId);
} catch (e: any) {
  console.error('Error running signPdfDocument:', e);
}
process.exit(0);

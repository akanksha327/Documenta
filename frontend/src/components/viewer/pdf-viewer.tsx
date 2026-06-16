'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useSignatureStore } from '@/store/signature-store';
import { SignatureField } from './signature-field';
import { Loader2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

// Configure the worker source using unpkg matching package versions
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version || '6.0.227'}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

interface PDFViewerProps {
  fileUrl: string;
}

export function PDFViewer({ fileUrl }: PDFViewerProps) {
  const {
    fields,
    zoom,
    currentPage,
    setCurrentPage,
    setTotalPages,
    setSelectedFieldId,
    logActivity,
  } = useSignatureStore();

  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Load PDF relatively via Next.js proxy/rewrites to bypass CORS preflights
  const absolutePdfUrl = fileUrl;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setTotalPages(numPages);
    setLoading(false);
    logActivity(`PDF loaded successfully. Total pages: ${numPages}`);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error('PDF loading error:', err);
    setLoadError(err.message || 'Failed to load PDF document');
    setLoading(false);
    logActivity(`Failed to load PDF: ${err.message}`);
  };

  // Deselect active field when clicking page background
  const handlePageClick = () => {
    setSelectedFieldId(null);
  };

  // Render overlay elements on top of the canvas
  const renderOverlays = () => {
    return fields
      .filter((f) => f.page === currentPage)
      .map((field) => (
        <SignatureField
          key={field.id}
          field={field}
          containerRef={pageContainerRef}
        />
      ));
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full space-y-4">
      <div 
        className="flex-1 w-full flex justify-center items-start overflow-auto bg-[#F1F1F3]/40 rounded-3xl p-6 min-h-[500px]"
        onClick={handlePageClick}
      >
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Rendering pages...</span>
          </div>
        )}

        {loadError && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 max-w-sm">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Failed to render PDF</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ensure the backend is running and the PDF document is valid. ({loadError})
            </p>
          </div>
        )}

        <Document
          file={absolutePdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          className="shadow-md rounded-2xl overflow-hidden border border-border"
        >
          {numPages && (
            <div
              ref={pageContainerRef}
              className="relative bg-white"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
            >
              <Page
                pageNumber={currentPage}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div className="flex items-center justify-center h-[600px] w-[450px]">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                }
              />
              {/* Overlay elements */}
              {renderOverlays()}
            </div>
          )}
        </Document>
      </div>
    </div>
  );
}
export default PDFViewer;

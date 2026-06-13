'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/auth-store';
import { useDocumentStore } from '@/store/document-store';
import { useSignatureStore } from '@/store/signature-store';
import { ArrowLeft, Loader2, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PropertiesPanel } from '@/components/viewer/properties-panel';
import { SignatureToolbar } from '@/components/viewer/signature-toolbar';
import { ActivityTimeline } from '@/components/viewer/activity-timeline';
import { ZoomControls } from '@/components/viewer/zoom-controls';
import { PageNavigation } from '@/components/viewer/page-navigation';

// Load PDFViewer dynamically to bypass Next.js SSR build errors for client-only canvas libraries
const PDFViewer = dynamic(
  () => import('@/components/viewer/pdf-viewer').then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center py-40 gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Initializing document viewer...</span>
      </div>
    ),
  }
);

export default function DocumentViewerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const token = useAuthStore((s) => s.token);
  const { activeDocument, isLoading: isDocLoading, fetchDocumentById } = useDocumentStore();
  const { fetchFields, isLoading: isSigLoading } = useSignatureStore();

  useEffect(() => {
    if (!token) {
      router.push('/');
    } else if (id) {
      fetchDocumentById(id);
      fetchFields(id);
    }
  }, [token, id, router]);

  if (!token) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FFF9FC]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if ((isDocLoading || isSigLoading) && !activeDocument) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-[#FFF9FC] gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Opening workspace...</span>
      </div>
    );
  }

  if (!activeDocument) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-[#FFF9FC] gap-4 text-center p-6">
        <h2 className="text-lg font-bold text-foreground">Document Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-xs">
          This document could not be loaded. Please return to your documents dashboard.
        </p>
        <Button onClick={() => router.push('/documents')} size="sm">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9FC] flex flex-col">
      {/* Designer Capsule Header (Floating style top-center capsule) */}
      <header className="w-full max-w-6xl mx-auto px-4 pt-4 sm:px-6">
        <div className="bg-white/85 border border-[#F1F1F3] rounded-[1.5rem] px-5 py-3 shadow-xs backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Back button and details */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href={`/documents/${id}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#F1F1F3] bg-white text-muted-foreground hover:bg-[#FCE7F3] hover:text-[#D94687] transition-all active:scale-95 group shrink-0"
              title="Back to Details"
            >
              <ArrowLeft className="h-4.5 w-4.5 transition-transform group-hover:-translate-x-0.5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <h1 className="text-xs font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">
                  {activeDocument.originalName}
                </h1>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Signature Prep Workspace
              </p>
            </div>
          </div>

          {/* Center floating tools (Zoom & Pages) */}
          <div className="flex items-center gap-3">
            <PageNavigation />
            <ZoomControls />
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: PDF canvas viewer (takes 2 cols on desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-[500px]">
          {/* Editor Toolbar */}
          <SignatureToolbar documentId={id} />

          {/* Render PDF Canvas */}
          <div className="flex-1 relative border border-[#F1F1F3] bg-white rounded-3xl overflow-hidden shadow-xs min-h-[540px]">
            <PDFViewer fileUrl={activeDocument.fileUrl} />
          </div>
        </div>

        {/* Right Column: Properties Inspector & Timeline */}
        <div className="space-y-4">
          <PropertiesPanel />
          <ActivityTimeline />
        </div>
      </main>
    </div>
  );
}

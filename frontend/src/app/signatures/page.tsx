'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useDocumentStore, Document } from '@/store/document-store';
import { Navbar } from '@/components/dashboard/navbar';
import { StatusBadge } from '@/components/documents/status-badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileSignature, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function SignaturesListPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { documents, isLoading, fetchDocuments } = useDocumentStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'signed'>('pending');

  useEffect(() => {
    if (!token) {
      router.push('/');
    } else {
      fetchDocuments();
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FFF9FC]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Filter documents by status matching the signature workflow
  const pendingDocs = documents.filter((d) => d.status === 'Pending' || d.status === 'Draft');
  const signedDocs = documents.filter((d) => d.status === 'Signed');

  const activeDocsList = activeTab === 'pending' ? pendingDocs : signedDocs;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#FFF9FC] pb-16">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
        {/* Header Title */}
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight sm:text-2xl">
            Signature Workflows
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track signing requests, review pending documents, and access finished files
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <Card className="border border-[#F1F1F3] bg-white p-4 shadow-xs rounded-2xl flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pending / Draft</p>
              <p className="text-xl font-bold text-foreground mt-0.5">{pendingDocs.length}</p>
            </div>
          </Card>
          <Card className="border border-[#F1F1F3] bg-white p-4 shadow-xs rounded-2xl flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-500">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Signed Files</p>
              <p className="text-xl font-bold text-foreground mt-0.5">{signedDocs.length}</p>
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 border-b border-border pb-px">
          <button
            onClick={() => setActiveTab('pending')}
            className={`relative pb-3 text-xs font-semibold px-2 focus:outline-none transition-colors ${
              activeTab === 'pending' ? 'text-[#D94687] border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Action Required ({pendingDocs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('signed')}
            className={`relative pb-3 text-xs font-semibold px-2 focus:outline-none transition-colors ${
              activeTab === 'signed' ? 'text-[#D94687] border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Completed Documents ({signedDocs.length})</span>
          </button>
        </div>

        {/* Tab Content Display */}
        {isLoading && documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Loading workflows...</span>
          </div>
        ) : activeDocsList.length === 0 ? (
          <Card className="border border-[#F1F1F3] bg-white p-12 text-center max-w-md mx-auto rounded-[2rem] space-y-3">
            <div className="h-10 w-10 mx-auto flex items-center justify-center rounded-full bg-[#FCE7F3] text-primary">
              <FileSignature className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">No workflows found</h3>
            <p className="text-xs text-muted-foreground">
              {activeTab === 'pending'
                ? 'No documents require signature placement currently.'
                : 'No documents have been signed yet.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3.5">
            {activeDocsList.map((doc) => (
              <Card
                key={doc.id}
                className="border border-[#F1F1F3] bg-white p-4.5 shadow-xs rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm hover:translate-y-[-1px] transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-secondary border border-border/80 flex items-center justify-center text-primary">
                    <FileSignature className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground tracking-tight sm:text-sm">
                      {doc.originalName}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span>{format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3.5">
                  <StatusBadge status={doc.status} />
                  <Link
                    href={`/documents/${doc.id}/viewer`}
                    className="inline-flex h-8.5 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-primary to-[#D94687] text-white px-3.5 text-xs font-semibold hover:brightness-105 transition-all duration-200 active:scale-95 group"
                  >
                    <span>View Workspace</span>
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useDocumentStore } from '@/store/document-store';
import { Navbar } from '@/components/dashboard/navbar';
import { StatsCard } from '@/components/documents/stats-card';
import { SearchBar } from '@/components/documents/search-bar';
import { FilterTabs } from '@/components/documents/filter-tabs';
import { EmptyState } from '@/components/documents/empty-state';
import { UploadZone } from '@/components/documents/upload-zone';
import { DocumentTable } from '@/components/documents/document-table';
import { DocumentCard } from '@/components/documents/document-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Files,
  FileSignature,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2,
  X,
  Share2,
} from 'lucide-react';

export default function DocumentsPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const {
    documents,
    stats,
    isLoading,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
  } = useDocumentStore();

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Authenticate client-side
  useEffect(() => {
    if (!token) {
      router.push('/');
    } else {
      fetchDocuments();
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight sm:text-2xl">
              Documents
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Manage, organize and track your files
            </p>
          </div>
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-gradient-to-r from-primary to-[#D94687] text-white font-semibold text-xs shadow-md shadow-primary/20 hover:brightness-105 transition-all duration-200 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Document</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatsCard
            label="Total"
            value={stats.total}
            icon={<Files className="h-4 w-4" />}
          />
          <StatsCard
            label="Shared"
            value={stats.sharedLinks}
            icon={<Share2 className="h-4 w-4 text-blue-500" />}
          />
          <StatsCard
            label="Pending"
            value={stats.pending}
            icon={<Clock className="h-4 w-4 text-amber-500" />}
          />
          <StatsCard
            label="Signed"
            value={stats.signed}
            icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
          />
          <StatsCard
            label="Rejected"
            value={stats.rejected}
            icon={<XCircle className="h-4 w-4 text-red-500" />}
          />
        </div>

        {/* Search & Filters Controls */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <FilterTabs activeTab={statusFilter} onChange={setStatusFilter} />
        </div>

        {/* Documents Listing */}
        {isLoading && documents.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Loading documents...</span>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            title={
              searchQuery || statusFilter !== 'All'
                ? 'No matching documents found'
                : 'No documents uploaded yet'
            }
            description={
              searchQuery || statusFilter !== 'All'
                ? 'Try adjusting your search query or switching filters to find what you are looking for.'
                : 'Manage, organize, and track your signing files in one central place.'
            }
            actionText={
              searchQuery || statusFilter !== 'All'
                ? 'Clear filters'
                : 'Upload Your First Document'
            }
            onActionClick={
              searchQuery || statusFilter !== 'All'
                ? () => {
                    setSearchQuery('');
                    setStatusFilter('All');
                  }
                : () => setIsUploadOpen(true)
            }
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block">
              <DocumentTable documents={documents} onDelete={deleteDocument} />
            </div>

            {/* Mobile Cards View */}
            <div className="block sm:hidden grid grid-cols-1 gap-4">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} onDelete={deleteDocument} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Upload Dialog Modal Overlay */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsUploadOpen(false)}
          />
          <Card className="relative z-10 w-full max-w-md border border-border bg-white p-6 shadow-xl rounded-[2rem] animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider pl-1">
                Upload Document
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <UploadZone
              onUpload={uploadDocument}
              onClose={() => setIsUploadOpen(false)}
            />
          </Card>
        </div>
      )}
    </div>
  );
}

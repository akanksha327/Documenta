import React from 'react';
import { FileText, Eye, Trash2, Calendar, HardDrive, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Document, useDocumentStore } from '@/store/document-store';
import { StatusBadge } from './status-badge';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const { toast } = useToast();
  const shareDocument = useDocumentStore((s) => s.shareDocument);

  const handleShare = async (id: string) => {
    const token = await shareDocument(id);
    if (token) {
      const shareUrl = `${window.location.origin}/documents/${id}/viewer`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Signing link copied to clipboard successfully!",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Sharing Failed",
        description: "Could not generate sharing link for this document.",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4 hover:shadow-md transition-shadow">
      {/* Header: Icon + Title */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary border border-border">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/documents/${document.id}`}
            className="block text-sm font-semibold text-foreground truncate hover:text-primary transition-colors hover:underline decoration-primary/30"
          >
            {document.originalName}
          </Link>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
            <StatusBadge status={document.status} />
          </div>
        </div>
      </div>

      {/* Body: Metadata (Size & Upload Date) */}
      <div className="grid grid-cols-2 gap-2 border-t border-b border-border/60 py-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <HardDrive className="h-3.5 w-3.5" />
          <span>{formatFileSize(document.fileSize)}</span>
        </div>
        <div className="flex items-center gap-1.5 justify-end sm:justify-start">
          <Calendar className="h-3.5 w-3.5" />
          <span>{format(new Date(document.uploadedAt), 'MMM d, yyyy')}</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => handleShare(document.id)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-primary transition-all active:scale-95"
          title="Share Signing Link"
        >
          <Share2 className="h-4 w-4" />
        </button>
        <Link
          href={`/documents/${document.id}`}
          className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-95"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View details</span>
        </Link>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
              onDelete(document.id);
            }
          }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95"
          title="Delete Document"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

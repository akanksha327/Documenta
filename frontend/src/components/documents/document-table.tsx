import React from 'react';
import { FileText, Eye, Trash2, Calendar, HardDrive, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Document, useDocumentStore } from '@/store/document-store';
import { StatusBadge } from './status-badge';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface DocumentTableProps {
  documents: Document[];
  onDelete: (id: string) => void;
}

export function DocumentTable({ documents, onDelete }: DocumentTableProps) {
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
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <th scope="col" className="px-6 py-3.5">Document Name</th>
              <th scope="col" className="px-6 py-3.5 hidden sm:table-cell">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Upload Date</span>
                </div>
              </th>
              <th scope="col" className="px-6 py-3.5 hidden md:table-cell">
                <div className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5" />
                  <span>Size</span>
                </div>
              </th>
              <th scope="col" className="px-6 py-3.5">Status</th>
              <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="group hover:bg-secondary/20 transition-colors duration-150"
              >
                <td className="px-6 py-4 font-medium text-foreground">
                  <div className="flex items-center gap-3 max-w-[280px] sm:max-w-[360px]">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary border border-border group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="truncate text-sm font-medium text-foreground hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-2"
                      title={doc.originalName}
                    >
                      {doc.originalName}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                  {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                  {formatFileSize(doc.fileSize)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleShare(doc.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-primary transition-all active:scale-95"
                      title="Share Signing Link"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-95"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
                          onDelete(doc.id);
                        }
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95"
                      title="Delete Document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

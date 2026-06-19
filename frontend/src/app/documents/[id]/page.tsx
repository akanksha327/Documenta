'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useDocumentStore } from '@/store/document-store';
import { useSignatureStore } from '@/store/signature-store';
import { Navbar } from '@/components/dashboard/navbar';
import { StatusBadge } from '@/components/documents/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  FileText,
  Calendar,
  HardDrive,
  User,
  Download,
  ExternalLink,
  Loader2,
  Activity,
  FileSignature,
  Share2,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const token = useAuthStore((s) => s.token);
  const { activeDocument, isLoading, error, fetchDocumentById } = useDocumentStore();
  const { fields, fetchFields } = useSignatureStore();
  const { toast } = useToast();
  const shareDocument = useDocumentStore((s) => s.shareDocument);

  const handleShare = async () => {
    const shareToken = await shareDocument(id);
    if (shareToken) {
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
  
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/');
    } else if (id) {
      fetchDocumentById(id);
      fetchFields(id);
    }
  }, [token, id, router]);

  useEffect(() => {
    if (token && id) {
      setIsLogsLoading(true);
      fetch(`/api/audit/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Failed to load audit logs');
        })
        .then((data) => {
          setAuditLogs(data);
          setIsLogsLoading(false);
        })
        .catch((err) => {
          console.error('Audit logs error:', err);
          setIsLogsLoading(false);
        });
    }
  }, [token, id]);

  const getFriendlyDevice = (ua: string | null) => {
    if (!ua) return 'Unknown';
    if (ua.includes('Chrome')) return 'Chrome Browser';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari Browser';
    if (ua.includes('Firefox')) return 'Firefox Browser';
    if (ua.includes('Edge')) return 'Edge Browser';
    return 'Web Client';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!token) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading && !activeDocument) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Loading document details...</span>
        </div>
      </div>
    );
  }

  if (error || !activeDocument) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
            <Activity className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Document Not Found
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {error || 'This document could not be found or you do not have permission to view it.'}
          </p>
          <Link
            href="/documents"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-primary transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Documents
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/documents"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to documents</span>
          </Link>
        </div>

        {/* Master Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Preview Canvas (takes 2/3 cols on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="flex flex-col border border-border bg-card shadow-xs overflow-hidden h-[540px] rounded-3xl">
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b border-border bg-secondary/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground truncate max-w-[180px] sm:max-w-xs">
                    {activeDocument.originalName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/documents/${id}/viewer`}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-[#D94687] text-white px-3.5 text-xs font-semibold shadow-xs hover:brightness-105 transition-all duration-200 active:scale-[0.98]"
                  >
                    <FileSignature className="h-3.5 w-3.5" />
                    <span>Open Editor</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="h-8 gap-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-primary transition-all active:scale-95"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share Link</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`http://localhost:3001${activeDocument.fileUrl}`, '_blank')}
                    className="h-8 gap-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open PDF</span>
                  </Button>
                  <a
                    href={`http://localhost:3001${activeDocument.fileUrl}`}
                    download={activeDocument.originalName}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>

              {/* PDF Preview Canvas Mock */}
              <div className="flex-1 bg-muted/30 p-8 overflow-y-auto flex justify-center items-start">
                <Card className="w-full max-w-[480px] border border-border bg-card shadow-md p-10 space-y-6 aspect-[1/1.414] min-h-[460px] relative">
                  {/* Document Title Header */}
                  <div className="border-b border-border/80 pb-4">
                    <div className="h-2.5 w-20 bg-muted rounded mb-2" />
                    <h3 className="text-base font-semibold text-foreground truncate">
                      {activeDocument.originalName.replace(/\.[^/.]+$/, '')}
                    </h3>
                  </div>

                  {/* Body Paragraph Mock */}
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-muted/60 rounded" />
                    <div className="h-2 w-full bg-muted/60 rounded" />
                    <div className="h-2 w-full bg-muted/60 rounded" />
                    <div className="h-2 w-3/4 bg-muted/60 rounded" />
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="h-2 w-full bg-muted/60 rounded" />
                    <div className="h-2 w-full bg-muted/60 rounded" />
                    <div className="h-2 w-1/2 bg-muted/60 rounded" />
                  </div>

                  {/* Signature area placeholder */}
                  <div className="pt-10 flex justify-between items-end border-t border-border/60">
                    <div className="space-y-1">
                      <div className="h-6 w-24 border-b border-dashed border-border" />
                      <span className="text-[10px] text-muted-foreground uppercase">Recipient Signature</span>
                    </div>
                    <div className="space-y-1 text-right">
                      {activeDocument.status === 'Signed' ? (
                        <div className="text-xs font-semibold text-green-600 italic px-2 py-0.5 rounded bg-green-50 border border-green-100 mb-1">
                          ✓ Digitally Signed
                        </div>
                      ) : (
                        <div className="h-6 w-24 border-b border-dashed border-border" />
                      )}
                      <span className="text-[10px] text-muted-foreground uppercase">Date</span>
                    </div>
                  </div>

                  {/* Overlay actual placed signature fields */}
                  {fields.map((field) => {
                    const fontStyles: Record<string, string> = {
                      'Great Vibes': 'font-[var(--font-great-vibes)]',
                      'Alex Brush': 'font-[var(--font-alex-brush)]',
                      'Sacramento': 'font-[var(--font-sacramento)]',
                      'Playball': 'font-[var(--font-playball)]',
                      'Herr Von Muellerhoff': 'font-[var(--font-herr-von-muellerhoff)]',
                      'Default': 'font-semibold',
                    };
                    const fontStyleClass = fontStyles[field.fontFamily || 'Great Vibes'] || 'font-serif italic';
                    return (
                      <div
                        key={field.id}
                        style={{
                          position: 'absolute',
                          left: `${field.x}%`,
                          top: `${field.y}%`,
                          width: `${field.width}%`,
                          height: `${field.height}%`,
                        }}
                        className={cn(
                          "rounded-xl border flex flex-col p-1.5 justify-center items-center text-center text-[7px] select-none pointer-events-none transition-all",
                          field.isSigned
                            ? "bg-transparent border-transparent"
                            : field.type === 'signature'
                            ? "bg-[#E85D9E]/5 border-[#E85D9E]/30 text-[#E85D9E]"
                            : field.type === 'name'
                            ? "bg-[#A855F7]/5 border-[#A855F7]/30 text-[#A855F7]"
                            : "bg-purple-500/5 border-purple-500/30 text-purple-500"
                        )}
                      >
                        {field.isSigned ? (
                          field.type === 'signature' ? (
                            field.value?.startsWith('data:image/') ? (
                              <img src={field.value} className="max-h-full object-contain pointer-events-none select-none" alt="Signature" />
                            ) : (
                              <span className={cn("text-xs text-[#1e3a8a] truncate w-full select-none leading-none", fontStyleClass)}>
                                {field.value}
                              </span>
                            )
                          ) : field.type === 'name' ? (
                            <span className={cn("text-[9px] text-foreground font-bold truncate w-full select-none leading-none", field.fontFamily === 'Default' ? 'font-sans' : fontStyleClass)}>
                              {field.value}
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold text-foreground font-mono select-none leading-none">
                              {field.value}
                            </span>
                          )
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <span className="font-bold uppercase tracking-wider text-[6px]">
                              {field.type}
                            </span>
                            <span className="text-[5px] text-muted-foreground/60">(Pending)</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </Card>
              </div>
            </Card>
          </div>

          {/* Right Column: Metadata & Activity Panels */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <Card className="border border-border bg-card p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Document Details
              </h3>
              
              <div className="divide-y divide-border/60 text-xs">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={activeDocument.status} />
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <HardDrive className="h-3.5 w-3.5" />
                    <span>Size</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {formatFileSize(activeDocument.fileSize)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Uploaded</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {format(new Date(activeDocument.uploadedAt), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>Owner</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {useAuthStore.getState().user?.name || 'Me'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Live Audit Log Card */}
            <Card className="border border-border bg-card p-5 shadow-xs space-y-4 rounded-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Document Audit Trail
                </h3>
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-bold text-green-600 uppercase border border-green-100 animate-pulse">
                  Live Feed
                </span>
              </div>

              {/* Activity Timeline */}
              {isLogsLoading && auditLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 gap-1">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-[10px] text-muted-foreground">Loading log entries...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No log records found for this document.
                </div>
              ) : (
                <div className="space-y-4 relative pl-4 border-l border-border text-xs max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="relative group">
                      <span className="absolute -left-[20px] top-1 flex h-2 w-2 rounded-full bg-primary ring-4 ring-white" />
                      <p className="font-semibold text-foreground">{log.action}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        By <span className="font-semibold text-foreground">{log.userName || 'System'}</span> • {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                      <p className="text-[9px] text-muted-foreground/80 mt-1 font-mono">
                        Device: {getFriendlyDevice(log.device)} • IP: {log.ipAddress || 'unknown'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

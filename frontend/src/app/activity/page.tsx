'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Navbar } from '@/components/dashboard/navbar';
import { Card } from '@/components/ui/card';
import { Loader2, Activity, ShieldAlert, Monitor, Terminal, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLogEntry {
  id: string;
  documentId: string;
  userName: string | null;
  action: string;
  device: string | null;
  ipAddress: string | null;
  createdAt: string;
  document: {
    originalName: string;
  };
}

export default function ActivityPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    setIsLoading(true);
    fetch('/api/audit', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to retrieve audit trail logs');
      })
      .then((data) => {
        setLogs(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to fetch logs');
        setIsLoading(false);
      });
  }, [token, router]);

  const getFriendlyDevice = (ua: string | null) => {
    if (!ua) return 'Unknown Client';
    if (ua.includes('Chrome')) return 'Chrome Browser';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari Browser';
    if (ua.includes('Firefox')) return 'Firefox Browser';
    if (ua.includes('Edge')) return 'Edge Browser';
    return 'Web App Client';
  };

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

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight sm:text-2xl">
            Activity Trail
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enterprise audit trail listing all document modifications, uploads, and signature placements
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Loading audit log stream...</span>
          </div>
        ) : error ? (
          <Card className="border border-border bg-card p-12 text-center max-w-md mx-auto rounded-[2rem] space-y-3">
            <div className="h-10 w-10 mx-auto flex items-center justify-center rounded-full bg-red-50 text-red-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Failed to load logs</h3>
            <p className="text-xs text-muted-foreground">{error}</p>
          </Card>
        ) : logs.length === 0 ? (
          <Card className="border border-border bg-card p-16 text-center max-w-lg mx-auto rounded-[2rem] space-y-4">
            <div className="h-12 w-12 mx-auto flex items-center justify-center rounded-full bg-secondary text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">No Logs Registered</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Activity logs will register automatically once you upload documents and start placing signature placeholders.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Live activity logs list */}
            <Card className="border border-border bg-card p-6 shadow-xs rounded-[2rem]">
              <div className="divide-y divide-[#F1F1F3] text-xs">
                {logs.map((log) => (
                  <div key={log.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-secondary/40 border border-[#FCE7F3] flex items-center justify-center text-primary shrink-0 group-hover:bg-secondary transition-colors">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground text-sm">{log.action}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span>{log.document?.originalName}</span>
                          </span>
                          <span>•</span>
                          <span>By <span className="font-semibold text-foreground">{log.userName || 'System'}</span></span>
                          <span>•</span>
                          <span>{format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-2 self-start sm:self-auto text-[10px]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-muted-foreground border border-border/80">
                        <Monitor className="h-3 w-3" />
                        <span>{getFriendlyDevice(log.device)}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary/30 px-2 py-0.5 text-primary font-mono border border-primary/5">
                        <Terminal className="h-3 w-3" />
                        <span>{log.ipAddress || 'unknown'}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

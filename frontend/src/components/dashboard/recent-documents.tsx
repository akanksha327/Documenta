'use client';

import { useAuthStore } from '@/store/auth-store';
import { format } from 'date-fns';
import { FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const badgeStyles: Record<string, string> = {
  Draft: 'bg-blue-50 text-blue-700 border-blue-200/50',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200/50',
  Signed: 'bg-green-50 text-green-700 border-green-200/50',
  Rejected: 'bg-red-50 text-red-700 border-red-200/50',
};

export function RecentDocuments() {
  const { recentDocuments } = useAuthStore();

  if (recentDocuments.length === 0) {
    return (
      <div className="rounded-[2rem] border border-border/80 bg-white p-8 text-center">
        <p className="text-xs text-muted-foreground">No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-border/80 bg-white overflow-hidden shadow-sm">
      <div className="divide-y divide-border/60">
        {recentDocuments.map((doc) => {
          // Normalize status casing
          const normalizedStatus = doc.status.charAt(0).toUpperCase() + doc.status.slice(1);
          return (
            <div
              key={doc.id}
              className="flex items-center justify-between px-5 py-4 transition-colors duration-150 hover:bg-secondary/10 group"
            >
              <div className="min-w-0 flex-1 flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/80 text-primary border border-border/40 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/documents/${doc.id}`}
                    className="truncate text-xs font-semibold text-foreground hover:text-primary transition-colors block"
                  >
                    {doc.title}
                  </Link>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-tight ${
                    badgeStyles[normalizedStatus] || badgeStyles.Draft
                  }`}
                >
                  {normalizedStatus}
                </span>
                <Link
                  href={`/documents/${doc.id}/viewer`}
                  className="p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-primary active:scale-95 transition-all"
                  title="Open in Viewer"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

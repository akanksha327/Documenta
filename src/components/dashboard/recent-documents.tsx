'use client';

import { useAuthStore } from '@/store/auth-store';
import { format } from 'date-fns';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  signed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-slate-50 text-slate-600 border-slate-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

export function RecentDocuments() {
  const { recentDocuments } = useAuthStore();

  if (recentDocuments.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center">
        <p className="text-sm text-muted-foreground">No documents yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">
          Recent Documents
        </h3>
      </div>
      <div className="divide-y divide-border">
        {recentDocuments.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between px-5 py-3.5 transition-colors duration-100 hover:bg-muted/50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {doc.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {format(new Date(doc.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
            <span
              className={`ml-3 shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${
                statusStyles[doc.status] || statusStyles.draft
              }`}
            >
              {doc.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

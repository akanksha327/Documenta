'use client';

import { FileText, Clock, CheckCircle2 } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}

export function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow duration-150 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent || 'bg-muted'}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function DocumentsStatCard({ value }: { value: number }) {
  return (
    <StatCard
      label="Total Documents"
      value={value}
      icon={<FileText className="h-4 w-4 text-pink-500" />}
      accent="bg-pink-50"
    />
  );
}

export function PendingStatCard({ value }: { value: number }) {
  return (
    <StatCard
      label="Pending Signature"
      value={value}
      icon={<Clock className="h-4 w-4 text-rose-400" />}
      accent="bg-rose-50"
    />
  );
}

export function SignedStatCard({ value }: { value: number }) {
  return (
    <StatCard
      label="Signed"
      value={value}
      icon={<CheckCircle2 className="h-4 w-4 text-fuchsia-500" />}
      accent="bg-fuchsia-50"
    />
  );
}

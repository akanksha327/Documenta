'use client';

import { useAuthStore } from '@/store/auth-store';
import { Navbar } from './navbar';
import {
  DocumentsStatCard,
  PendingStatCard,
  SignedStatCard,
} from './stat-card';
import { RecentDocuments } from './recent-documents';

export function Dashboard() {
  const { user, stats } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s an overview of your document activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DocumentsStatCard value={stats?.total ?? 0} />
          <PendingStatCard value={stats?.pending ?? 0} />
          <SignedStatCard value={stats?.signed ?? 0} />
        </div>

        {/* Recent Documents */}
        <div className="mt-8">
          <RecentDocuments />
        </div>
      </main>
    </div>
  );
}

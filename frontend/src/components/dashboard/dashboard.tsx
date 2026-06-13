'use client';

import { useAuthStore } from '@/store/auth-store';
import { Navbar } from './navbar';
import { RecentDocuments } from './recent-documents';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileSignature, 
  FileUp, 
  Settings, 
  History, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Plus,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export function Dashboard() {
  const { user, stats, setView } = useAuthStore();

  const quickActions = [
    {
      label: 'Upload Document',
      description: 'Import a PDF to prepare or sign.',
      icon: FileUp,
      href: '/documents',
      color: 'bg-pink-50 text-primary border-pink-100',
    },
    {
      label: 'Signature Fields',
      description: 'Configure drop zones on your files.',
      icon: FileSignature,
      href: '/documents',
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    },
  ];

  const activities = [
    {
      action: 'Account registered',
      detail: 'Profile initialized successfully',
      time: 'Just now',
      icon: Clock,
      color: 'text-primary bg-secondary/80',
    },
    {
      action: 'Workspace configured',
      detail: 'Document folders linked',
      time: 'Just now',
      icon: Settings,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Asymmetric 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Main Section (Span 2 Columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Handcrafted Welcome Section */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>SignFlow Workspace</span>
              </div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight sm:text-3xl">
                Welcome back, {user?.name}
              </h1>
              <p className="text-sm text-muted-foreground max-w-lg">
                Manage, organize, and sign your documents inside your clean, secure digital signature environment.
              </p>
            </div>

            {/* Compact Statistics Badges Row */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="rounded-[1.5rem] border border-border/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary">
                    <FileSignature className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total</p>
                    <p className="text-lg font-bold text-foreground">{stats?.total ?? 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="rounded-[1.5rem] border border-border/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
                    <p className="text-lg font-bold text-foreground">{stats?.pending ?? 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="rounded-[1.5rem] border border-border/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Signed</p>
                    <p className="text-lg font-bold text-foreground">{stats?.signed ?? 0}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Documents Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider pl-1">
                  Recent Documents
                </h2>
                <Link
                  href="/documents"
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <span>View all</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <RecentDocuments />
            </div>
          </div>

          {/* Right Sidebar Section (Span 1 Column) */}
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            <Card className="rounded-[2rem] border border-border/80 bg-white p-6 shadow-sm">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {quickActions.map((action, idx) => (
                  <Link
                    key={idx}
                    href={action.href}
                    className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-white p-3.5 transition-all duration-200 hover:border-primary/20 hover:shadow-sm active:scale-[0.99]"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${action.color} transition-colors group-hover:brightness-[0.98]`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {action.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Activity Feed / Audit Trail */}
            <Card className="rounded-[2rem] border border-border/80 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Activity Feed
                </h2>
                <History className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              
              <div className="space-y-4">
                {activities.map((act, idx) => (
                  <div key={idx} className="flex gap-3 text-xs items-start">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${act.color}`}>
                      <act.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {act.action}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {act.detail}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                      {act.time}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}

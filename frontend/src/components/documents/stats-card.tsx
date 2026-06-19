import React from 'react';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
}

export function StatsCard({ label, value, icon, description }: StatsCardProps) {
  return (
    <Card className="flex items-center justify-between border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <h3 className="text-2xl font-semibold text-foreground tracking-tight">
          {value}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
        {icon}
      </div>
    </Card>
  );
}

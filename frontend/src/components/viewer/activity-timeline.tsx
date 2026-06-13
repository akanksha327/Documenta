import React from 'react';
import { useSignatureStore } from '@/store/signature-store';
import { Card } from '@/components/ui/card';
import { Activity, Circle } from 'lucide-react';

export function ActivityTimeline() {
  const activityLog = useSignatureStore((s) => s.activityLog);

  return (
    <Card className="border border-border bg-white p-5 shadow-sm space-y-4 rounded-2xl flex flex-col h-full max-h-[300px]">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Activity className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Activity Trail
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
        {activityLog.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            No activity logged yet
          </div>
        ) : (
          <div className="relative pl-3 border-l border-border space-y-3.5 text-[11px] leading-relaxed">
            {activityLog.map((log, index) => (
              <div key={index} className="relative group">
                {/* Timeline dot */}
                <span className="absolute -left-[16px] top-1 flex h-1.5 w-1.5 rounded-full bg-primary ring-4 ring-white" />
                <p className="font-medium text-foreground">{log}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

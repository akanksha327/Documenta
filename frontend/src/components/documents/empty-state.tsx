import React from 'react';
import { FileUp, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onActionClick: () => void;
  title?: string;
  description?: string;
  actionText?: string;
}

export function EmptyState({
  onActionClick,
  title = 'No documents uploaded yet',
  description = 'Manage, organize, and track your signing files in one central place.',
  actionText = 'Upload Your First Document',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white py-14 px-6 text-center shadow-sm">
      {/* Icon/Illustration Area */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary mb-4">
        <FolderPlus className="h-6 w-6" />
      </div>

      {/* Text Info */}
      <h3 className="text-sm font-semibold text-foreground tracking-tight mb-1">
        {title}
      </h3>
      <p className="max-w-xs text-xs text-muted-foreground mb-5">
        {description}
      </p>

      {/* Action Trigger */}
      <Button
        onClick={onActionClick}
        className="gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium text-xs shadow-sm shadow-primary/10 transition-all active:scale-[0.98]"
      >
        <FileUp className="h-3.5 w-3.5" />
        {actionText}
      </Button>
    </div>
  );
}

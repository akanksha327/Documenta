import React from 'react';
import { useSignatureStore } from '@/store/signature-store';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ZoomControls() {
  const { zoom, setZoom, logActivity } = useSignatureStore();

  const handleZoomIn = () => {
    const nextZoom = Math.min(2.0, zoom + 0.1);
    setZoom(nextZoom);
    logActivity(`Zoom level set to ${Math.round(nextZoom * 100)}%`);
  };

  const handleZoomOut = () => {
    const nextZoom = Math.max(0.6, zoom - 0.1);
    setZoom(nextZoom);
    logActivity(`Zoom level set to ${Math.round(nextZoom * 100)}%`);
  };

  const handleZoomReset = () => {
    setZoom(1.0);
    logActivity('Zoom level reset to 100%');
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-white/95 shadow-md p-1 backdrop-blur-xs">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleZoomOut}
        disabled={zoom <= 0.6}
        className="h-8 w-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-xs font-semibold text-foreground min-w-[48px] text-center select-none">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleZoomIn}
        disabled={zoom >= 2.0}
        className="h-8 w-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <div className="h-4 w-px bg-border mx-0.5" />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleZoomReset}
        disabled={zoom === 1.0}
        className="h-8 w-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
        title="Reset Zoom"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

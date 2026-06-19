import React from 'react';
import { useSignatureStore } from '@/store/signature-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Settings2, Hash, Move, Sparkles } from 'lucide-react';

export function PropertiesPanel() {
  const { fields, selectedFieldId, deleteField, updateFieldDimensions, updateFieldPosition } = useSignatureStore();

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  if (!selectedField) {
    return (
      <Card className="border border-border bg-card p-5 shadow-sm rounded-2xl flex flex-col justify-center items-center text-center min-h-[160px]">
        <Settings2 className="h-6 w-6 text-muted-foreground/60 mb-2 stroke-[1.5]" />
        <p className="text-xs font-semibold text-foreground">No Element Selected</p>
        <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">
          Click any signature, name, or date field on the document to view and edit its properties.
        </p>
      </Card>
    );
  }

  const handleWidthChange = (val: number) => {
    updateFieldDimensions(selectedField.id, val, selectedField.height);
  };

  const handleHeightChange = (val: number) => {
    updateFieldDimensions(selectedField.id, selectedField.width, val);
  };

  const handleXChange = (val: number) => {
    updateFieldPosition(selectedField.id, val, selectedField.y);
  };

  const handleYChange = (val: number) => {
    updateFieldPosition(selectedField.id, selectedField.x, val);
  };

  return (
    <Card className="border border-border bg-card p-5 shadow-sm rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Field Properties
          </h3>
        </div>
        <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold text-primary capitalize">
          {selectedField.type}
        </span>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-secondary/35 rounded-lg p-2 border border-border/40 space-y-0.5">
            <span className="text-[9px] text-muted-foreground uppercase font-semibold">Page Position</span>
            <div className="flex items-center gap-1 font-semibold text-foreground text-[11px]">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span>Page {selectedField.page}</span>
            </div>
          </div>
          <div className="bg-secondary/35 rounded-lg p-2 border border-border/40 space-y-0.5">
            <span className="text-[9px] text-muted-foreground uppercase font-semibold">Field ID</span>
            <div className="font-mono text-muted-foreground text-[9px] truncate" title={selectedField.id}>
              {selectedField.id.startsWith('temp-') ? 'unsaved' : selectedField.id}
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-2.5">
          {/* Position inputs */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Move className="h-3 w-3" />
              Position (Relative %)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1 bg-secondary/25 border border-border rounded-lg px-2 py-1">
                <span className="text-[10px] text-muted-foreground font-mono">X:</span>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={Math.round(selectedField.x)}
                  onChange={(e) => handleXChange(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent border-0 p-0 text-xs font-semibold focus:ring-0 outline-none"
                />
              </div>
              <div className="flex items-center gap-1 bg-secondary/25 border border-border rounded-lg px-2 py-1">
                <span className="text-[10px] text-muted-foreground font-mono">Y:</span>
                <input
                  type="number"
                  min="0"
                  max="95"
                  value={Math.round(selectedField.y)}
                  onChange={(e) => handleYChange(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent border-0 p-0 text-xs font-semibold focus:ring-0 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Size inputs */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Size (Relative %)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1 bg-secondary/25 border border-border rounded-lg px-2 py-1">
                <span className="text-[10px] text-muted-foreground font-mono">W:</span>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={Math.round(selectedField.width)}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 5)}
                  className="w-full bg-transparent border-0 p-0 text-xs font-semibold focus:ring-0 outline-none"
                />
              </div>
              <div className="flex items-center gap-1 bg-secondary/25 border border-border rounded-lg px-2 py-1">
                <span className="text-[10px] text-muted-foreground font-mono">H:</span>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={Math.round(selectedField.height)}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 2)}
                  className="w-full bg-transparent border-0 p-0 text-xs font-semibold focus:ring-0 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <div className="pt-2 border-t border-border">
          <Button
            variant="destructive"
            onClick={() => deleteField(selectedField.id)}
            className="w-full h-8.5 rounded-lg font-semibold gap-1.5 transition-all text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Remove Field</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

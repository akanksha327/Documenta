import React from 'react';
import { useSignatureStore } from '@/store/signature-store';
import { FileSignature, User, CalendarRange, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignatureToolbarProps {
  documentId: string;
}

export function SignatureToolbar({ documentId }: SignatureToolbarProps) {
  const { addField, saveFields, isSaving, currentPage } = useSignatureStore();

  const handleAddField = (type: 'signature' | 'name' | 'date') => {
    addField(documentId, type, currentPage);
  };

  const handleSave = async () => {
    await saveFields(documentId);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-white p-3 shadow-sm rounded-2xl">
      {/* Field Actions */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-2 hidden sm:inline-block">
          Insert Fields:
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleAddField('signature')}
          className="h-8.5 rounded-lg border border-primary/10 bg-primary/5 text-primary hover:bg-primary/10 font-semibold gap-1.5 transition-all text-xs"
        >
          <FileSignature className="h-4 w-4" />
          <span>Signature</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleAddField('name')}
          className="h-8.5 rounded-lg border border-accent/10 bg-accent/5 text-accent hover:bg-accent/10 font-semibold gap-1.5 transition-all text-xs"
        >
          <User className="h-4 w-4" />
          <span>Full Name</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleAddField('date')}
          className="h-8.5 rounded-lg border-purple-100 bg-purple-50 text-[#A855F7] hover:bg-purple-100 font-semibold gap-1.5 transition-all text-xs"
        >
          <CalendarRange className="h-4 w-4" />
          <span>Date</span>
        </Button>
      </div>

      {/* Save action */}
      <div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-8.5 rounded-lg bg-gradient-to-r from-primary to-[#D94687] text-white hover:brightness-105 transition-all font-semibold gap-1.5 shadow-xs text-xs"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>Save Layout</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

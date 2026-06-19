import React from 'react';
import { useSignatureStore } from '@/store/signature-store';
import { FileSignature, User, CalendarRange, Save, Loader2, CheckCircle2, LayoutGrid, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SignatureToolbarProps {
  documentId: string;
}

export function SignatureToolbar({ documentId }: SignatureToolbarProps) {
  const {
    addField,
    saveFields,
    isSaving,
    currentPage,
    mode,
    setMode,
    completeDocumentSigning,
    fields,
  } = useSignatureStore();

  const router = useRouter();
  const { toast } = useToast();

  const handleAddField = (type: 'signature' | 'name' | 'date') => {
    addField(documentId, type, currentPage);
  };

  const handleSave = async () => {
    const success = await saveFields(documentId);
    if (success) {
      toast({
        title: 'Layout Saved',
        description: 'Document placeholder layout saved successfully!',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save layout changes to the cloud.',
      });
    }
  };

  const handleFinishSigning = async () => {
    // Validation check: Make sure all signature fields are signed
    const unsignedFields = fields.filter((f) => !f.isSigned);
    if (unsignedFields.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Unsigned Fields',
        description: `Please click and fill/sign all ${unsignedFields.length} placeholder(s) before finishing.`,
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Fields Placed',
        description: 'Please switch to Design mode and place signature fields first.',
      });
      return;
    }

    const success = await completeDocumentSigning(documentId);
    if (success) {
      toast({
        title: 'Document Signed',
        description: 'The document has been successfully signed and certified!',
      });
      // Redirect back to document details page after short delay
      setTimeout(() => {
        router.push(`/documents/${documentId}`);
      }, 1000);
    } else {
      toast({
        variant: 'destructive',
        title: 'Signing Failed',
        description: 'An error occurred while sealing the document signatures.',
      });
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-card p-3.5 shadow-sm rounded-[1.5rem]">
      {/* Mode Selector Switch */}
      <div className="flex bg-secondary/20 p-1 rounded-xl border border-primary/10 mr-2">
        <button
          type="button"
          onClick={() => setMode('design')}
          className={cn(
            'flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-semibold rounded-lg transition-all',
            mode === 'design'
              ? 'bg-gradient-to-r from-primary to-[#D94687] text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span>Design Layout</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('sign')}
          className={cn(
            'flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-semibold rounded-lg transition-all',
            mode === 'sign'
              ? 'bg-gradient-to-r from-primary to-[#D94687] text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <PenTool className="h-3.5 w-3.5" />
          <span>Sign Document</span>
        </button>
      </div>

      {/* Mode Contextual Options */}
      {mode === 'design' ? (
        <div className="flex flex-1 flex-wrap items-center justify-between gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mr-1 hidden md:inline-block">
              Placeholders:
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAddField('signature')}
              className="h-8.5 rounded-lg border border-primary/10 bg-primary/5 text-primary hover:bg-primary/10 font-semibold gap-1.5 transition-all text-xs"
            >
              <FileSignature className="h-3.5 w-3.5" />
              <span>Signature</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAddField('name')}
              className="h-8.5 rounded-lg border border-accent/10 bg-accent/5 text-accent hover:bg-accent/10 font-semibold gap-1.5 transition-all text-xs"
            >
              <User className="h-3.5 w-3.5" />
              <span>Full Name</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAddField('date')}
              className="h-8.5 rounded-lg border-purple-100 bg-purple-50 text-[#A855F7] hover:bg-purple-100 font-semibold gap-1.5 transition-all text-xs"
            >
              <CalendarRange className="h-3.5 w-3.5" />
              <span>Date</span>
            </Button>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-8.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all font-semibold gap-1.5 shadow-xs text-xs ml-auto"
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
      ) : (
        <div className="flex flex-1 items-center justify-end">
          <Button
            onClick={handleFinishSigning}
            disabled={isSaving}
            className="h-8.5 rounded-lg bg-gradient-to-r from-primary to-[#D94687] text-white hover:brightness-105 transition-all font-semibold gap-1.5 shadow-md shadow-primary/10 text-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Finish & Certified Sign</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

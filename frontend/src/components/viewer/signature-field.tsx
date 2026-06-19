import React, { useRef, useState, useEffect } from 'react';
import { useSignatureStore, SignatureField as ISignatureField } from '@/store/signature-store';
import { Trash2, FileSignature, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SigningDialog } from './signing-dialog';

interface SignatureFieldProps {
  field: ISignatureField;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function SignatureField({ field, containerRef }: SignatureFieldProps) {
  const {
    selectedFieldId,
    setSelectedFieldId,
    updateFieldPosition,
    updateFieldDimensions,
    deleteField,
    mode,
    signField
  } = useSignatureStore();
  
  const fieldRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, fieldX: 0, fieldY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, fieldW: 0, fieldH: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isSelected = selectedFieldId === field.id && mode === 'design';

  // Handle drag mouse down
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode === 'sign') return;
    e.stopPropagation();
    setSelectedFieldId(field.id);
    setIsDragging(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragStart({
      x: clientX,
      y: clientY,
      fieldX: field.x,
      fieldY: field.y,
    });
  };

  // Handle resize mouse down
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode === 'sign') return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedFieldId(field.id);
    setIsResizing(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setResizeStart({
      x: clientX,
      y: clientY,
      fieldW: field.width,
      fieldH: field.height,
    });
  };

  // Global listeners for dragging and resizing
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const deltaX = clientX - dragStart.x;
        const deltaY = clientY - dragStart.y;
        
        // Convert pixel change to relative percentage
        const deltaXPercent = (deltaX / rect.width) * 100;
        const deltaYPercent = (deltaY / rect.height) * 100;

        updateFieldPosition(field.id, dragStart.fieldX + deltaXPercent, dragStart.fieldY + deltaYPercent);
      }

      if (isResizing) {
        const deltaX = clientX - resizeStart.x;
        const deltaY = clientY - resizeStart.y;

        // Convert pixel change to relative percentage
        const deltaWPercent = (deltaX / rect.width) * 100;
        const deltaHPercent = (deltaY / rect.height) * 100;

        updateFieldDimensions(field.id, resizeStart.fieldW + deltaWPercent, resizeStart.fieldH + deltaHPercent);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, field.id, containerRef, updateFieldPosition, updateFieldDimensions]);

  // Icons based on type
  const renderIcon = () => {
    switch (field.type) {
      case 'signature':
        return <FileSignature className="h-4.5 w-4.5 text-primary shrink-0" />;
      case 'name':
        return <User className="h-4.5 w-4.5 text-accent shrink-0" />;
      case 'date':
        return <Calendar className="h-4.5 w-4.5 text-purple-500 shrink-0" />;
    }
  };

  // Label names
  const renderLabel = () => {
    switch (field.type) {
      case 'signature':
        return 'Signature';
      case 'name':
        return 'Full Name';
      case 'date':
        return 'Date';
    }
  };

  // Content placeholders
  const renderPlaceholder = () => {
    switch (field.type) {
      case 'signature':
        return (
          <div className="flex-1 flex flex-col justify-center items-center border-t border-dashed border-primary/20 pt-1 text-primary/65">
            <span className="text-[9px] uppercase tracking-wider font-semibold">Sign Here</span>
            <div className="h-0.5 w-3/4 border-b border-primary/30 border-dashed mt-1.5" />
          </div>
        );
      case 'name':
        return (
          <div className="flex-1 flex flex-col justify-center items-center border-t border-dashed border-accent/20 pt-1 text-accent/65">
            <span className="text-[9px] uppercase tracking-wider font-semibold">Print Name</span>
          </div>
        );
      case 'date':
        return (
          <div className="flex-1 flex flex-col justify-center items-center border-t border-dashed border-purple-500/20 pt-1 text-purple-500/65">
            <span className="text-[9px] uppercase tracking-wider font-semibold">Today's Date</span>
          </div>
        );
    }
  };

  const fontStyles: Record<string, string> = {
    'Great Vibes': 'font-[var(--font-great-vibes)]',
    'Alex Brush': 'font-[var(--font-alex-brush)]',
    'Sacramento': 'font-[var(--font-sacramento)]',
    'Playball': 'font-[var(--font-playball)]',
    'Herr Von Muellerhoff': 'font-[var(--font-herr-von-muellerhoff)]',
    'Default': 'font-semibold',
  };

  const renderContent = () => {
    if (!field.isSigned) {
      return (
        <div className="flex-1 flex flex-col justify-center min-h-0">
          {renderPlaceholder()}
          {mode === 'sign' && (
            <span className="text-[8px] font-bold text-center text-primary/80 uppercase tracking-widest mt-1 animate-pulse">
              Click to Sign
            </span>
          )}
        </div>
      );
    }

    const verificationHash = field.signatureHash || 'SF-VERIFIED';

    switch (field.type) {
      case 'signature':
        return (
          <div className="flex-1 flex flex-col justify-center items-center min-h-0 relative py-0.5">
            {field.value?.startsWith('data:image/') ? (
              <img
                src={field.value}
                alt="Signature"
                className="flex-1 max-h-[85%] object-contain select-none pointer-events-none"
              />
            ) : (
              <span className={cn("text-xl text-[#1e3a8a] text-center truncate w-full select-none leading-tight", fontStyles[field.fontFamily || 'Great Vibes'] || 'font-serif font-semibold italic')}>
                {field.value}
              </span>
            )}
            <div className="w-full flex justify-between items-center text-[7px] text-muted-foreground/60 border-t border-dotted border-border mt-1 pt-0.5 px-0.5">
              <span className="font-bold text-[6px] tracking-tight uppercase text-emerald-600">✓ Secure Signed</span>
              <span className="font-mono font-bold tracking-tighter">{verificationHash}</span>
            </div>
          </div>
        );
      case 'name':
        return (
          <div className="flex-1 flex flex-col justify-center items-center min-h-0 relative py-0.5">
            <span className={cn("text-xs text-foreground text-center truncate w-full select-none font-bold", fontStyles[field.fontFamily || 'Default'] || 'font-sans')}>
              {field.value}
            </span>
            <div className="w-full flex justify-between items-center text-[7px] text-muted-foreground/60 border-t border-dotted border-border mt-1 pt-0.5 px-0.5">
              <span className="font-bold text-[6px] tracking-tight uppercase text-purple-600">✓ Verified Name</span>
              <span className="font-mono font-bold tracking-tighter">{verificationHash}</span>
            </div>
          </div>
        );
      case 'date':
        return (
          <div className="flex-1 flex flex-col justify-center items-center min-h-0 relative py-0.5">
            <span className="text-xs font-semibold text-foreground text-center select-none font-mono">
              {field.value}
            </span>
            <div className="w-full flex justify-between items-center text-[7px] text-muted-foreground/60 border-t border-dotted border-border mt-1 pt-0.5 px-0.5">
              <span className="font-bold text-[6px] tracking-tight uppercase text-blue-600">✓ Sign Date</span>
              <span className="font-mono font-bold tracking-tighter">{verificationHash}</span>
            </div>
          </div>
        );
    }
  };

  const getColors = () => {
    if (field.isSigned && mode === 'sign') {
      return {
        bg: 'bg-transparent',
        selectedBorder: 'border-transparent',
        dashedBorder: 'border-transparent',
        accent: 'text-primary',
      };
    }

    switch (field.type) {
      case 'signature':
        return {
          bg: field.isSigned ? 'bg-card shadow-xs' : 'bg-[#E85D9E]/5 hover:bg-[#E85D9E]/10',
          selectedBorder: 'border-[#E85D9E]',
          dashedBorder: field.isSigned ? 'border-[#E85D9E]/30 hover:border-[#E85D9E]/70' : 'border-[#E85D9E]/40 hover:border-[#E85D9E]/80',
          accent: 'text-[#E85D9E]',
        };
      case 'name':
        return {
          bg: field.isSigned ? 'bg-card shadow-xs' : 'bg-[#A855F7]/5 hover:bg-[#A855F7]/10',
          selectedBorder: 'border-[#A855F7]',
          dashedBorder: field.isSigned ? 'border-[#A855F7]/30 hover:border-[#A855F7]/70' : 'border-[#A855F7]/40 hover:border-[#A855F7]/80',
          accent: 'text-[#A855F7]',
        };
      case 'date':
        return {
          bg: field.isSigned ? 'bg-card shadow-xs' : 'bg-purple-500/5 hover:bg-purple-500/10',
          selectedBorder: 'border-purple-500',
          dashedBorder: field.isSigned ? 'border-purple-500/30 hover:border-purple-500/70' : 'border-purple-500/40 hover:border-purple-500/80',
          accent: 'text-purple-500',
        };
    }
  };

  const showFullBox = !field.isSigned || mode === 'design';
  const themeColors = getColors();

  return (
    <>
      <div
        ref={fieldRef}
        style={{
          left: `${field.x}%`,
          top: `${field.y}%`,
          width: `${field.width}%`,
          height: `${field.height}%`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedFieldId(field.id);
          if (mode === 'sign') {
            setIsDialogOpen(true);
          }
        }}
        className={cn(
          'absolute z-30 select-none rounded-xl flex flex-col transition-all',
          showFullBox ? 'p-2.5' : 'p-0.5',
          mode === 'design' ? 'cursor-move' : 'cursor-pointer hover:scale-[1.01] duration-150',
          themeColors.bg,
          isSelected
            ? cn('border-2 shadow-md', themeColors.selectedBorder)
            : showFullBox
            ? cn('border-2 border-dashed', themeColors.dashedBorder)
            : 'border-2 border-transparent'
        )}
      >
        {/* Header bar with icon, title, and delete option */}
        {showFullBox && (
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              {renderIcon()}
              <span className="text-[10px] font-bold tracking-tight text-foreground truncate">
                {renderLabel()}
              </span>
            </div>

            {/* Action icons when selected in Design Mode */}
            {isSelected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteField(field.id);
                }}
                className="rounded-full p-0.5 text-muted-foreground hover:text-red-500 hover:bg-red-50/50 transition-colors"
                title="Delete field"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {/* Main Content */}
        <div
          className="flex-1 flex flex-col justify-center min-h-0"
          onMouseDown={mode === 'design' ? handleDragStart : undefined}
          onTouchStart={mode === 'design' ? handleDragStart : undefined}
        >
          {renderContent()}
        </div>

        {/* Resize Handle at Bottom-Right in Design Mode */}
        {isSelected && (
          <div
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            className={cn(
              'absolute bottom-0 right-0 h-3.5 w-3.5 rounded-tl-md rounded-br-xl cursor-se-resize border-t border-l flex items-center justify-center bg-card shadow-xs',
              themeColors.selectedBorder
            )}
            title="Resize field"
          >
            {/* Diagonal tiny dots or lines */}
            <div className="w-1.5 h-1.5 border-r border-b border-muted-foreground/50 rotate-45 transform -translate-x-0.5 -translate-y-0.5" />
          </div>
        )}
      </div>

      {isDialogOpen && (
        <SigningDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          type={field.type}
          defaultValue={field.value}
          defaultFontFamily={field.fontFamily}
          onSign={(val, font, hash) => {
            signField(field.id, val, font, hash);
          }}
        />
      )}
    </>
  );
}

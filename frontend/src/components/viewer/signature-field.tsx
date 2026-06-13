import React, { useRef, useState, useEffect } from 'react';
import { useSignatureStore, SignatureField as ISignatureField } from '@/store/signature-store';
import { Trash2, FileSignature, User, Calendar, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignatureFieldProps {
  field: ISignatureField;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function SignatureField({ field, containerRef }: SignatureFieldProps) {
  const { selectedFieldId, setSelectedFieldId, updateFieldPosition, updateFieldDimensions, deleteField } = useSignatureStore();
  const fieldRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, fieldX: 0, fieldY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, fieldW: 0, fieldH: 0 });

  const isSelected = selectedFieldId === field.id;

  // Handle drag mouse down
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
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

  const getColors = () => {
    switch (field.type) {
      case 'signature':
        return {
          bg: 'bg-[#E85D9E]/5 hover:bg-[#E85D9E]/10',
          selectedBorder: 'border-[#E85D9E]',
          dashedBorder: 'border-[#E85D9E]/40 hover:border-[#E85D9E]/80',
          accent: 'text-[#E85D9E]',
        };
      case 'name':
        return {
          bg: 'bg-[#A855F7]/5 hover:bg-[#A855F7]/10',
          selectedBorder: 'border-[#A855F7]',
          dashedBorder: 'border-[#A855F7]/40 hover:border-[#A855F7]/80',
          accent: 'text-[#A855F7]',
        };
      case 'date':
        return {
          bg: 'bg-purple-500/5 hover:bg-purple-500/10',
          selectedBorder: 'border-purple-500',
          dashedBorder: 'border-purple-500/40 hover:border-purple-500/80',
          accent: 'text-purple-500',
        };
    }
  };

  const themeColors = getColors();

  return (
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
      }}
      className={cn(
        'absolute z-30 select-none rounded-xl flex flex-col p-2.5 transition-shadow shadow-xs cursor-move',
        themeColors.bg,
        isSelected
          ? cn('border-2 shadow-md', themeColors.selectedBorder)
          : cn('border-2 border-dashed', themeColors.dashedBorder)
      )}
    >
      {/* Header bar with icon, title, and delete option */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {renderIcon()}
          <span className="text-[10px] font-bold tracking-tight text-foreground truncate">
            {renderLabel()}
          </span>
        </div>

        {/* Action icons when selected */}
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

      {/* Main Drag Handles & Placeholder Content */}
      <div
        className="flex-1 flex flex-col justify-center min-h-0"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {renderPlaceholder()}
      </div>

      {/* Resize Handle at Bottom-Right */}
      {isSelected && (
        <div
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          className={cn(
            'absolute bottom-0 right-0 h-3.5 w-3.5 rounded-tl-md rounded-br-xl cursor-se-resize border-t border-l flex items-center justify-center bg-white shadow-xs',
            themeColors.selectedBorder.replace('border-', 'border-')
          )}
          title="Resize field"
        >
          {/* Diagonal tiny dots or lines */}
          <div className="w-1.5 h-1.5 border-r border-b border-muted-foreground/50 rotate-45 transform -translate-x-0.5 -translate-y-0.5" />
        </div>
      )}
    </div>
  );
}

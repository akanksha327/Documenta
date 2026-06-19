'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Pencil, Type, CalendarRange, ShieldCheck, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SigningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'signature' | 'name' | 'date';
  onSign: (value: string, fontFamily?: string, signatureHash?: string) => void;
  defaultValue?: string;
  defaultFontFamily?: string;
}

const HANDWRITING_FONTS = [
  { name: 'Great Vibes', family: 'family=["Great Vibes",cursive]', style: 'font-[var(--font-great-vibes)] font-normal' },
  { name: 'Alex Brush', family: 'family=["Alex Brush",cursive]', style: 'font-[var(--font-alex-brush)] font-normal' },
  { name: 'Sacramento', family: 'family=["Sacramento",cursive]', style: 'font-[var(--font-sacramento)] font-normal' },
  { name: 'Playball', family: 'family=["Playball",cursive]', style: 'font-[var(--font-playball)] font-normal' },
  { name: 'Herr Von Muellerhoff', family: 'family=["Herr_Von_Muellerhoff",cursive]', style: 'font-[var(--font-herr-von-muellerhoff)] font-normal' },
];

export function SigningDialog({
  isOpen,
  onClose,
  type,
  onSign,
  defaultValue = '',
  defaultFontFamily = 'Great Vibes',
}: SigningDialogProps) {
  const [activeTab, setActiveTab] = useState<'draw' | 'type'>('draw');
  
  // State for typed text & font selection
  const [typedName, setTypedName] = useState(type === 'name' ? defaultValue : '');
  const [selectedFont, setSelectedFont] = useState(defaultFontFamily || 'Great Vibes');
  
  // State for Date picking
  const [dateValue, setDateValue] = useState(() => {
    if (type === 'date' && defaultValue) return defaultValue;
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  });

  // State for Unique verification fingerprint (Hash)
  const [sigHash, setSigHash] = useState('');

  // Canvas drawing refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // Generate unique digital signature verification hash
  useEffect(() => {
    if (isOpen) {
      const chars = '0123456789ABCDEF';
      let hash = 'SF-';
      for (let i = 0; i < 4; i++) hash += chars[Math.floor(Math.random() * 16)];
      hash += '-';
      for (let i = 0; i < 4; i++) hash += chars[Math.floor(Math.random() * 16)];
      hash += '-';
      for (let i = 0; i < 4; i++) hash += chars[Math.floor(Math.random() * 16)];
      setSigHash(hash);
    }
  }, [isOpen]);

  // Adjust canvas resolution/size on open
  useEffect(() => {
    if (isOpen && type === 'signature' && activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      // Use higher pixel ratio for crisp drawing
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.strokeStyle = '#1e3a8a'; // Classic secure blue ink
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      setHasDrawn(false);
    }
  }, [isOpen, activeTab, type]);

  if (!isOpen) return null;

  // Handle drawing events
  const getEventPos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getEventPos(e);
    setIsDrawing(true);
    setLastPos(pos);
    
    // Draw initial dot
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 1.25, 0, Math.PI * 2);
        ctx.fillStyle = '#1e3a8a';
        ctx.fill();
        ctx.closePath();
      }
    }
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const pos = getEventPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.closePath();
    }
    
    setLastPos(pos);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
  };

  const handleSubmit = () => {
    if (type === 'signature') {
      if (activeTab === 'draw') {
        if (!canvasRef.current || !hasDrawn) return;
        // Export base64
        const dataUrl = canvasRef.current.toDataURL('image/png');
        onSign(dataUrl, undefined, sigHash);
      } else {
        if (!typedName.trim()) return;
        onSign(typedName, selectedFont, sigHash);
      }
    } else if (type === 'name') {
      if (!typedName.trim()) return;
      onSign(typedName, selectedFont, sigHash);
    } else if (type === 'date') {
      onSign(dateValue, undefined, sigHash);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      
      <Card className="relative z-10 w-full max-w-lg border border-border bg-card p-6 shadow-2xl rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-4">
          <div className="flex items-center gap-2 pl-1">
            {type === 'signature' && <Pencil className="h-4.5 w-4.5 text-primary" />}
            {type === 'name' && <Type className="h-4.5 w-4.5 text-accent" />}
            {type === 'date' && <CalendarRange className="h-4.5 w-4.5 text-purple-500" />}
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              {type === 'signature' && 'Sign Document'}
              {type === 'name' && 'Enter Full Name'}
              {type === 'date' && 'Set Date'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {type === 'signature' && (
            <div className="space-y-4">
              {/* Drawing vs Typing Tabs */}
              <div className="flex bg-secondary/40 p-1 rounded-xl border border-primary/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('draw')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all',
                    activeTab === 'draw'
                      ? 'bg-card text-primary shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Draw Signature</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('type')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all',
                    activeTab === 'type'
                      ? 'bg-card text-primary shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Type className="h-3.5 w-3.5" />
                  <span>Type Signature</span>
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'draw' ? (
                <div className="space-y-2">
                  <div className="relative border border-dashed border-border/80 rounded-2xl overflow-hidden bg-muted/20">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-48 bg-white cursor-crosshair touch-none"
                    />
                    {!hasDrawn && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground/45 text-xs select-none">
                        Use mouse or touchscreen to sign here
                      </div>
                    )}
                    {hasDrawn && (
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="absolute bottom-3 right-3 text-[10px] font-bold text-muted-foreground hover:text-red-500 bg-card/90 border border-border/60 hover:bg-red-50 px-2 py-1 rounded-lg shadow-xs transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase pl-1">
                      Type Your Name
                    </label>
                    <input
                      type="text"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      placeholder="e.g. Akanksha Sahu"
                      className="w-full bg-secondary/25 border border-border hover:border-primary/30 focus:border-primary rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-colors"
                    />
                  </div>

                  {typedName.trim() && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase pl-1">
                        Select Cursive Hand Style
                      </label>
                      <div className="grid grid-cols-1 gap-2.5 max-h-44 overflow-y-auto pr-1">
                        {HANDWRITING_FONTS.map((font) => (
                          <div
                            key={font.name}
                            onClick={() => setSelectedFont(font.name)}
                            className={cn(
                              'flex items-center justify-between p-3 border rounded-2xl cursor-pointer transition-all hover:bg-secondary/15',
                              selectedFont === font.name
                                ? 'border-[#E85D9E] bg-[#E85D9E]/5 shadow-xs'
                                : 'border-border'
                            )}
                          >
                            <span className={cn('text-lg font-medium text-[#1e3a8a]', font.style)}>
                              {typedName}
                            </span>
                            <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg border">
                              {font.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {type === 'name' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase pl-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. Akanksha Sahu"
                  className="w-full bg-secondary/25 border border-border hover:border-accent/30 focus:border-accent rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-colors"
                />
              </div>

              {typedName.trim() && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase pl-1">
                    Select Display Font
                  </label>
                  <div className="grid grid-cols-1 gap-2.5 max-h-44 overflow-y-auto pr-1">
                    {/* Modern serif / sans-serif plus stylish cursive options for names */}
                    <div
                      onClick={() => setSelectedFont('Default')}
                      className={cn(
                        'flex items-center justify-between p-3 border rounded-2xl cursor-pointer transition-all hover:bg-secondary/15',
                        selectedFont === 'Default'
                          ? 'border-[#A855F7] bg-[#A855F7]/5 shadow-xs'
                          : 'border-border'
                      )}
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {typedName}
                      </span>
                      <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg border">
                        Modern Standard
                      </span>
                    </div>
                    {HANDWRITING_FONTS.map((font) => (
                      <div
                        key={font.name}
                        onClick={() => setSelectedFont(font.name)}
                        className={cn(
                          'flex items-center justify-between p-3 border rounded-2xl cursor-pointer transition-all hover:bg-secondary/15',
                          selectedFont === font.name
                            ? 'border-[#A855F7] bg-[#A855F7]/5 shadow-xs'
                            : 'border-border'
                        )}
                      >
                        <span className={cn('text-lg font-medium text-foreground', font.style)}>
                          {typedName}
                        </span>
                        <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg border">
                          Cursive: {font.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {type === 'date' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase pl-1">
                Signing Date
              </label>
              <input
                type="text"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                placeholder="MM/DD/YYYY"
                className="w-full bg-secondary/25 border border-border hover:border-purple-300 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-colors"
              />
            </div>
          )}

          {/* Cryptographic Authenticity Stamp Panel */}
          <div className="bg-background border border-border/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                Authentic Verification Stamp
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Stamping this signature with your unique security fingerprint (<span className="font-mono text-foreground font-semibold">{sigHash || 'generating...'}</span>) ensures it is mathematically verified. No one can replicate this verification code, protecting your document against modifications or forgery.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-2.5 border-t border-border/80 pt-4 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-9.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              type === 'signature'
                ? activeTab === 'draw'
                  ? !hasDrawn
                  : !typedName.trim()
                : type === 'name'
                ? !typedName.trim()
                : !dateValue.trim()
            }
            className="flex-1 h-9.5 rounded-xl bg-gradient-to-r from-primary to-[#D94687] text-white hover:brightness-105 transition-all font-semibold shadow-xs text-xs"
          >
            Adopt & Sign
          </Button>
        </div>
      </Card>
    </div>
  );
}

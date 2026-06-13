import React, { useRef, useState } from 'react';
import { FileUp, FileText, Loader2, CheckCircle2, AlertCircle, RefreshCw, UploadCloud } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface UploadZoneProps {
  onUpload: (file: File) => Promise<boolean>;
  onClose?: () => void;
}

export function UploadZone({ onUpload, onClose }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateAndUpload = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') {
      setErrorMessage('Only PDF documents are allowed.');
      setUploadState('error');
      return;
    }

    if (uploadedFile.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit.');
      setUploadState('error');
      return;
    }

    setFile(uploadedFile);
    setUploadState('uploading');
    setProgress(0);

    // Mock progress visual flow in sync with our Zustand store
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 150);

    const success = await onUpload(uploadedFile);
    clearInterval(interval);

    if (success) {
      setProgress(100);
      setUploadState('success');
      // Auto close/reset after a short delay if onClose is provided
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } else {
      setErrorMessage('An error occurred during file upload. Please try again.');
      setUploadState('error');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await validateAndUpload(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setFile(null);
    setUploadState('idle');
    setProgress(0);
    setErrorMessage('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {uploadState === 'idle' && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`flex flex-col items-center justify-center rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 border border-border bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
            isDragActive
              ? 'border-primary ring-2 ring-primary/20 scale-[1.01]'
              : 'border-border/60 hover:border-primary/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary border border-border/40 mb-4 shadow-sm">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-foreground tracking-tight mb-1">
            Drag and drop your PDF here
          </p>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mb-4">
            or click to browse your local files. Support files up to 10MB in size.
          </p>
          <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-primary">
            PDFs Only
          </span>
        </div>
      )}

      {uploadState === 'uploading' && file && (
        <div className="border border-border/80 rounded-3xl p-6 bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary border border-border/40">
              <FileText className="h-5.5 w-5.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">
                {file.name}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {formatFileSize(file.size)}
              </p>
            </div>
            <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-secondary [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-[#D94687]" />
          </div>
        </div>
      )}

      {uploadState === 'success' && file && (
        <div className="border border-border/80 rounded-3xl p-6 bg-white shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-200">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Document Uploaded
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
              {file.name} is ready for signatures.
            </p>
          </div>
        </div>
      )}

      {uploadState === 'error' && (
        <div className="border border-border/80 rounded-3xl p-6 bg-white shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Upload Failed
            </h4>
            <p className="text-xs text-red-600 mt-1.5 max-w-xs leading-relaxed">
              {errorMessage}
            </p>
          </div>
          <button
            onClick={resetUpload}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

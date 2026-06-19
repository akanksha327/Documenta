'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Loader2 } from 'lucide-react';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initializeSession = useAuthStore((s) => s.initializeSession);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeSession().finally(() => {
      setInitialized(true);
    });
  }, [initializeSession]);

  if (!initialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Initializing session...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

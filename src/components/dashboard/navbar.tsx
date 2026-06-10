'use client';

import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { FileSignature, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    const token = useAuthStore.getState().token;
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch {
        // Ignore network errors on logout
      }
    }
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left: Logo + App Name */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FileSignature className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold text-foreground">
            SignFlow
          </span>
        </div>

        {/* Right: User Info + Logout */}
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:block">
            {user?.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

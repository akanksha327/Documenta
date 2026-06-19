'use client';

import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { FileSignature, LogOut, LayoutDashboard, FolderOpen, Activity, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

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

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/documents', label: 'Documents', icon: FolderOpen },
    { href: '/signatures', label: 'Signatures', icon: FileSignature },
    { href: '/activity', label: 'Activity', icon: Activity },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Floating Capsule Navbar (Top Center) */}
      <header className="fixed top-5 left-1/2 z-50 hidden w-full max-w-6xl -translate-x-1/2 px-4 sm:block">
        <div className="flex h-16 items-center justify-between rounded-full border border-border/80 bg-card/80 px-5 py-2 shadow-lg shadow-primary/5 backdrop-blur-xl">
          {/* Logo + App Name */}
          <div className="flex shrink-0 items-center gap-3">
            <img 
              src="/logo.png" 
              alt="SignFlow Logo" 
              className="h-12 w-12 rounded-full border border-border/50 bg-background object-contain p-1 shadow-sm shadow-primary/10"
            />
            <div className="leading-tight">
              <span className="block text-lg font-semibold tracking-tight text-foreground">
                SignFlow
              </span>
              <span className="block text-[10px] font-semibold uppercase text-muted-foreground">
                Workspace
              </span>
            </div>
          </div>

          {/* Navigation Links with Liquid Bubble */}
          <nav className="mx-4 flex shrink-0 items-center gap-1 rounded-full border border-border/60 bg-background/70 p-1.5 shadow-inner">
            {navItems.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold tracking-tight transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary lg:px-4 ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeNavBubble"
                      className="absolute inset-0 rounded-full border border-border/60 bg-card shadow-sm"
                      transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.8 }}
                      style={{ zIndex: 0 }}
                    />
                  )}
                  <item.icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="flex shrink-0 items-center gap-2">
            <span className="max-w-28 truncate text-xs font-medium text-muted-foreground">
              {user?.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-9 gap-1.5 rounded-full text-xs font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Bar Capsule */}
      <nav className="fixed bottom-4 left-3 right-3 z-50 grid grid-cols-6 items-center rounded-full border border-border bg-card/90 px-2 py-2 shadow-xl shadow-primary/10 backdrop-blur-xl sm:hidden">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-w-0 flex-col items-center gap-1 rounded-full px-1.5 py-1.5 text-[9px] font-semibold transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="activeNavBubbleMobile"
                  className="absolute inset-0 rounded-full bg-secondary"
                  transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.8 }}
                  style={{ zIndex: 0 }}
                />
              )}
              <item.icon className="relative z-10 h-5 w-5" />
              <span className="relative z-10 max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex min-w-0 flex-col items-center gap-1 rounded-full px-1.5 py-1.5 text-[9px] font-semibold text-muted-foreground active:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span className="max-w-full truncate">Sign out</span>
        </button>
      </nav>
      
      {/* Spacer to push content down on desktop */}
      <div className="h-20 hidden sm:block" />
    </>
  );
}

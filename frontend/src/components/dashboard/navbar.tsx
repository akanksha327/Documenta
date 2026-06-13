'use client';

import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { FileSignature, LogOut, LayoutDashboard, FolderOpen, UserCheck } from 'lucide-react';
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
  ];

  return (
    <>
      {/* Desktop Floating Capsule Navbar (Top Center) */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4 hidden sm:block">
        <div className="flex h-14 items-center justify-between rounded-full border border-border/80 bg-white/70 backdrop-blur-md px-6 py-2 shadow-md shadow-primary/5">
          {/* Logo + App Name */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-primary to-[#D94687] shadow-sm shadow-primary/20">
              <FileSignature className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground tracking-tight">
              SignFlow
            </span>
          </div>

          {/* Navigation Links with Liquid Bubble */}
          <nav className="flex items-center gap-1.5 bg-secondary/30 rounded-full p-1 border border-border/40">
            {navItems.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-tight transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeNavBubble"
                      className="absolute inset-0 rounded-full bg-white shadow-sm border border-border/40"
                      transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.8 }}
                      style={{ zIndex: 0 }}
                    />
                  )}
                  <item.icon className="h-3.5 w-3.5 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              {user?.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 gap-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-95 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Bar Capsule */}
      <nav className="fixed bottom-5 left-5 right-5 z-50 rounded-full border border-border bg-white/80 backdrop-blur-md px-6 py-2 shadow-lg shadow-primary/5 flex items-center justify-between sm:hidden">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 py-1 px-4 text-[10px] font-semibold transition-colors duration-200 ${
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
              <item.icon className="h-5 w-5 relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-1 px-4 text-[10px] font-semibold text-muted-foreground active:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign out</span>
        </button>
      </nav>
      
      {/* Spacer to push content down on desktop */}
      <div className="h-20 hidden sm:block" />
    </>
  );
}

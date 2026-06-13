'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { FileSignature, Lock, Mail, Loader2 } from 'lucide-react';

export function LoginForm() {
  const { setUser, setView, setStats, setRecentDocuments, setLoading, isLoading, error, setError } =
    useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      setUser(data.user, data.token);

      // Fetch session data (stats + documents)
      const sessionRes = await fetch(`/api/auth/session?token=${data.token}`);
      const sessionData = await sessionRes.json();

      if (sessionRes.ok) {
        setStats(sessionData.stats);
        setRecentDocuments(sessionData.recentDocuments);
      }

      setView('dashboard');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 selection:bg-secondary">
      <Card className="w-full max-w-[450px] rounded-[2rem] border border-border/80 bg-white p-2 shadow-lg shadow-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
        <CardContent className="p-8 sm:p-10">
          {/* Logo */}
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-[#D94687] shadow-md shadow-primary/20">
              <FileSignature className="h-5.5 w-5.5 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-foreground tracking-tight">
              SignFlow
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Handcrafted signature workflows
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground uppercase tracking-wider pl-1">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/85" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-9 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary focus-visible:ring-1 focus-visible:border-primary focus-visible:ring-offset-0"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground uppercase tracking-wider pl-1">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/85" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-9 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary focus-visible:ring-1 focus-visible:border-primary focus-visible:ring-offset-0"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium text-destructive pl-1 animate-in fade-in duration-200">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-xl bg-gradient-to-r from-primary to-[#D94687] text-sm font-semibold text-white shadow-md shadow-primary/20 hover:brightness-105 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Register link */}
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => setView('register')}
              className="font-semibold text-primary hover:underline hover:text-[#D94687] transition-colors"
            >
              Create free account
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

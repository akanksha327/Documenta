'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { FileSignature } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-[440px] rounded-xl border border-border shadow-sm">
        <CardContent className="p-8 sm:p-10">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <FileSignature className="h-5 w-5 text-white" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-foreground">
              SignFlow
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Document signing made simple
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary/90 transition-colors duration-150"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => setView('register')}
              className="font-medium text-primary hover:underline"
            >
              Create account
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Lock, Loader2 } from 'lucide-react';

export function RegisterForm() {
  const { setUser, setView, setStats, setRecentDocuments, setLoading, isLoading, error, setError } =
    useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        setUser(loginData.user, loginData.token);

        // Fetch session data
        const sessionRes = await fetch(`/api/auth/session?token=${loginData.token}`);
        const sessionData = await sessionRes.json();

        if (sessionRes.ok) {
          setStats(sessionData.stats);
          setRecentDocuments(sessionData.recentDocuments);
        }

        setView('dashboard');
      } else {
        setView('login');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 selection:bg-secondary">
      <Card className="w-full max-w-[450px] rounded-[2rem] border border-border/80 bg-card p-2 shadow-lg shadow-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
        <CardContent className="p-8 sm:p-10">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <img 
              src="/logo.png" 
              alt="SignFlow Logo" 
              className="h-20 w-20 rounded-full object-contain bg-background p-1.5 border border-border/50 shadow-lg shadow-primary/10"
            />
            <h1 className="mt-4 text-2xl font-semibold text-foreground tracking-tight">
              Get started
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your free SignFlow account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-foreground uppercase tracking-wider pl-1">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/85" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 pl-9 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary focus-visible:ring-1 focus-visible:border-primary focus-visible:ring-offset-0"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-xs font-semibold text-foreground uppercase tracking-wider pl-1">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/85" />
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-9 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary focus-visible:ring-1 focus-visible:border-primary focus-visible:ring-offset-0"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-password" className="text-xs font-semibold text-foreground uppercase tracking-wider pl-1">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/85" />
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-9 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary focus-visible:ring-1 focus-visible:border-primary focus-visible:ring-offset-0"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs font-semibold text-foreground uppercase tracking-wider pl-1">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/85" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 pl-9 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary focus-visible:ring-1 focus-visible:border-primary focus-visible:ring-offset-0"
                  autoComplete="new-password"
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
                  <span>Creating account...</span>
                </span>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setView('login')}
              className="font-semibold text-primary hover:underline hover:text-primary transition-colors"
            >
              Sign in
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

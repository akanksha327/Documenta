'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { FileSignature } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-[440px] rounded-xl border border-border shadow-sm">
        <CardContent className="p-8 sm:p-10">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <FileSignature className="h-5 w-5 text-white" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-foreground">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started with SignFlow
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-sm font-medium text-foreground">
                Email address
              </Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                Confirm password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
                autoComplete="new-password"
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
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setView('login')}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

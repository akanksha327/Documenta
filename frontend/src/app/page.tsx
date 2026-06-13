'use client';

import { useAuthStore } from '@/store/auth-store';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { Dashboard } from '@/components/dashboard/dashboard';

export default function Home() {
  const view = useAuthStore((s) => s.view);

  return (
    <>
      {view === 'login' && <LoginForm />}
      {view === 'register' && <RegisterForm />}
      {view === 'dashboard' && <Dashboard />}
    </>
  );
}

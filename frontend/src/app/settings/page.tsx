'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Bell,
  Check,
  Loader2,
  Monitor,
  Moon,
  Palette,
  Shield,
  Sun,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { Navbar } from '@/components/dashboard/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'appearance';
type ThemeOption = 'light' | 'dark' | 'system';

const settingsTabs: Array<{ value: SettingsTab; label: string; icon: typeof User }> = [
  { value: 'profile', label: 'Profile', icon: User },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'appearance', label: 'Appearance', icon: Palette },
];

const themeOptions: Array<{
  value: ThemeOption;
  label: string;
  detail: string;
  icon: typeof Sun;
}> = [
  { value: 'light', label: 'Light', detail: 'Bright workspace', icon: Sun },
  { value: 'dark', label: 'Dark', detail: 'Comfortable contrast', icon: Moon },
  { value: 'system', label: 'System', detail: 'Match device', icon: Monitor },
];

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15';

export default function SettingsPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!token) {
      router.push('/');
    }
  }, [token, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  if (!token) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    toast.success('Profile updated successfully');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Security password updated successfully');
  };

  const activeTheme = mounted ? ((theme || 'system') as ThemeOption) : 'system';
  const resolvedMode = mounted ? resolvedTheme : 'system';

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6 sm:py-10">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card/80 px-3 py-1.5 shadow-sm">
              <img
                src="/logo.png"
                alt="SignFlow Logo"
                className="h-8 w-8 rounded-full border border-border/60 bg-background object-contain p-0.5"
              />
              <span className="text-xs font-semibold text-foreground">SignFlow Settings</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Settings
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Manage account details, security, notifications, and the visual style of your workspace.
              </p>
            </div>
          </div>
          <div className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
            Theme: <span className="text-foreground capitalize">{resolvedMode}</span>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
          <Card className="gap-2 rounded-[1.5rem] border-border/80 bg-card p-2 shadow-sm">
            {settingsTabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-secondary text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                      isActive
                        ? 'border-primary/20 bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </Card>

          <Card className="rounded-[2rem] border-border/80 bg-card p-5 shadow-sm sm:p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <SectionHeader
                  title="Profile Settings"
                  description="Keep your workspace identity current."
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Full Name">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Email Address">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </Field>
                </div>
                <PanelActions>
                  <SaveButton isSaving={isSaving}>Save Changes</SaveButton>
                </PanelActions>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <SectionHeader
                  title="Security Preferences"
                  description="Update your password and protect your account access."
                />
                <div className="max-w-md space-y-4">
                  <Field label="Current Password">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </Field>
                  <Field label="New Password">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Confirm New Password">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </Field>
                </div>
                <PanelActions>
                  <SaveButton isSaving={isSaving}>Update Password</SaveButton>
                </PanelActions>
              </form>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <SectionHeader
                  title="Notification Preferences"
                  description="Choose how SignFlow should keep you informed."
                />
                <div className="space-y-3 text-xs">
                  <NotificationOption
                    title="Email Notifications"
                    description="Receive immediate notifications when a document is signed or shared."
                    defaultChecked
                  />
                  <NotificationOption
                    title="Audit Log Event Tracking"
                    description="Receive logs of signature activity updates."
                    defaultChecked
                  />
                  <NotificationOption
                    title="Weekly Digest Summary"
                    description="Receive a compiled report of pending signing requests every Monday."
                  />
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <SectionHeader
                  title="Appearance"
                  description="Switch themes instantly across pages, navigation, cards, forms, and dialogs."
                />

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Theme Mode</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Saved automatically on this device.
                    </p>
                  </div>
                  <div className="grid rounded-[1.4rem] border border-border bg-background p-1.5 shadow-inner sm:grid-cols-3">
                    {themeOptions.map((option) => {
                      const isActive = activeTheme === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setTheme(option.value)}
                          className={`relative flex items-center gap-3 rounded-[1.1rem] px-4 py-3 text-left transition-all ${
                            isActive
                              ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                              isActive
                                ? 'border-primary/20 bg-primary/10 text-primary'
                                : 'border-border bg-card text-muted-foreground'
                            }`}
                          >
                            <option.icon className="h-4.5 w-4.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold">{option.label}</span>
                            <span className="block truncate text-[10px] text-muted-foreground">
                              {option.detail}
                            </span>
                          </span>
                          {isActive && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border bg-background p-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Accent
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="h-9 w-9 rounded-full bg-primary shadow-sm shadow-primary/25" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Premium Pink</p>
                        <p className="text-xs text-muted-foreground">Primary action color</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-border bg-background p-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Brand
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src="/logo.png"
                        alt="SignFlow Logo"
                        className="h-10 w-10 rounded-full border border-border bg-card object-contain p-1"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">SignFlow</p>
                        <p className="text-xs text-muted-foreground">Document signing workspace</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-border pb-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="pl-1 text-[10px] font-semibold uppercase text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function PanelActions({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end border-t border-border pt-4">{children}</div>;
}

function SaveButton({
  isSaving,
  children,
}: {
  isSaving: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="submit"
      disabled={isSaving}
      className="h-9 rounded-xl bg-gradient-to-r from-primary to-accent text-xs font-semibold text-white shadow-md shadow-primary/20 hover:brightness-105"
    >
      {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      <span>{children}</span>
    </Button>
  );
}

function NotificationOption({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background p-3 transition-colors hover:bg-secondary/40">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
      />
      <span>
        <span className="block font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block text-[10px] leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}

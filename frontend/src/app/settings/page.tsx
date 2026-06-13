'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Navbar } from '@/components/dashboard/navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, Bell, Palette, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'appearance'>('profile');
  
  // Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
      <div className="flex h-screen w-screen items-center justify-center bg-[#FFF9FC]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API delay
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

  return (
    <div className="min-h-screen bg-[#FFF9FC] pb-16">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight sm:text-2xl">
            Account Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure profile settings, login parameters, and appearance rules
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 items-start">
          {/* Settings Tabs Sidebar */}
          <Card className="border border-[#F1F1F3] bg-white p-2.5 shadow-xs rounded-[1.5rem] md:col-span-1 space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#FCE7F3] text-[#D94687]'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                activeTab === 'security'
                  ? 'bg-[#FCE7F3] text-[#D94687]'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                activeTab === 'notifications'
                  ? 'bg-[#FCE7F3] text-[#D94687]'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                activeTab === 'appearance'
                  ? 'bg-[#FCE7F3] text-[#D94687]'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Palette className="h-4 w-4" />
              <span>Appearance</span>
            </button>
          </Card>

          {/* Configuration Form Panel */}
          <Card className="border border-[#F1F1F3] bg-white p-6 shadow-xs rounded-[2rem] md:col-span-3">
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-sm font-semibold text-foreground">Profile Settings</h3>
                  <p className="text-[10px] text-muted-foreground">Manage your identity details on the app</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-9 rounded-xl bg-gradient-to-r from-primary to-[#D94687] text-white hover:brightness-105 font-semibold text-xs transition-all flex items-center gap-1.5"
                  >
                    {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Save Changes</span>
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-sm font-semibold text-foreground">Security Preferences</h3>
                  <p className="text-[10px] text-muted-foreground">Reset or update your account password</p>
                </div>

                <div className="space-y-3.5 max-w-md">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-9 rounded-xl bg-gradient-to-r from-primary to-[#D94687] text-white hover:brightness-105 font-semibold text-xs transition-all flex items-center gap-1.5"
                  >
                    {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Update Password</span>
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-sm font-semibold text-foreground">Notification Preferences</h3>
                  <p className="text-[10px] text-muted-foreground">Select how you want to be notified of signature requests</p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-secondary/35 rounded-xl transition-colors">
                    <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary h-4 w-4" />
                    <div>
                      <p className="font-semibold text-foreground">Email Notifications</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Receive immediate notifications when a document is signed or shared.</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-secondary/35 rounded-xl transition-colors">
                    <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary h-4 w-4" />
                    <div>
                      <p className="font-semibold text-foreground">Audit Log Event Tracking</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Receive logs of signature activity updates.</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-secondary/35 rounded-xl transition-colors">
                    <input type="checkbox" className="rounded border-border text-primary focus:ring-primary h-4 w-4" />
                    <div>
                      <p className="font-semibold text-foreground">Weekly Digest Summary</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Receive a compiled report of pending signing requests every Monday.</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-sm font-semibold text-foreground">Appearance Customize</h3>
                  <p className="text-[10px] text-muted-foreground">Change local color themes and visual preferences</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-foreground">Active Accent Color Palette</p>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 border-2 border-[#E85D9E] bg-[#E85D9E]/5 px-3 py-1.5 rounded-full text-[#E85D9E] font-semibold text-xs cursor-pointer">
                        <span className="h-3.5 w-3.5 rounded-full bg-[#E85D9E]" />
                        <span>Premium Pink</span>
                        <Check className="h-3 w-3" />
                      </div>
                      <div className="flex items-center gap-1.5 border border-border bg-white px-3 py-1.5 rounded-full text-muted-foreground font-semibold text-xs opacity-50 cursor-not-allowed">
                        <span className="h-3.5 w-3.5 rounded-full bg-blue-500" />
                        <span>Notion Slate</span>
                      </div>
                      <div className="flex items-center gap-1.5 border border-border bg-white px-3 py-1.5 rounded-full text-muted-foreground font-semibold text-xs opacity-50 cursor-not-allowed">
                        <span className="h-3.5 w-3.5 rounded-full bg-emerald-500" />
                        <span>Linear Emerald</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <p className="font-semibold text-foreground">Global Border Radius</p>
                    <div className="flex gap-2">
                      <div className="border border-border bg-[#FCE7F3] text-[#D94687] px-3.5 py-1.5 rounded-xl font-bold cursor-pointer">
                        1.25rem (Curved)
                      </div>
                      <div className="border border-border bg-white text-muted-foreground px-3.5 py-1.5 rounded-md font-medium cursor-not-allowed opacity-55">
                        0.75rem (Medium)
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

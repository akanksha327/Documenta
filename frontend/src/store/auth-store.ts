import { create } from 'zustand';

export type AuthView = 'login' | 'register' | 'dashboard';

interface User {
  id: string;
  name: string;
  email: string;
}

interface DocumentStats {
  total: number;
  pending: number;
  signed: number;
  sharedLinks: number;
}

interface RecentDocument {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface AuthState {
  view: AuthView;
  user: User | null;
  token: string | null;
  stats: DocumentStats | null;
  recentDocuments: RecentDocument[];
  isLoading: boolean;
  error: string | null;

  setView: (view: AuthView) => void;
  setUser: (user: User, token: string) => void;
  setStats: (stats: DocumentStats) => void;
  setRecentDocuments: (docs: RecentDocument[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  initializeSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  view: 'login',
  user: null,
  token: null,
  stats: null,
  recentDocuments: [],
  isLoading: false,
  error: null,

  setView: (view) => set({ view, error: null }),
  setUser: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, token, error: null });
  },
  setStats: (stats) => set({ stats }),
  setRecentDocuments: (docs) => set({ recentDocuments: docs }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({
      user: null,
      token: null,
      stats: null,
      recentDocuments: [],
      view: 'login',
      error: null,
    });
  },
  initializeSession: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        set({ user: userData, token, view: 'dashboard' });

        const sessionRes = await fetch(`/api/auth/session?token=${token}`);
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          set({ stats: sessionData.stats, recentDocuments: sessionData.recentDocuments });
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, view: 'login' });
      }
    } catch (err) {
      console.error('Session initialization error:', err);
    } finally {
      set({ isLoading: false });
    }
  },
}));

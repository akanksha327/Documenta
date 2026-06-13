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
}

export const useAuthStore = create<AuthState>((set) => ({
  view: 'login',
  user: null,
  token: null,
  stats: null,
  recentDocuments: [],
  isLoading: false,
  error: null,

  setView: (view) => set({ view, error: null }),
  setUser: (user, token) => set({ user, token, error: null }),
  setStats: (stats) => set({ stats }),
  setRecentDocuments: (docs) => set({ recentDocuments: docs }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () =>
    set({
      user: null,
      token: null,
      stats: null,
      recentDocuments: [],
      view: 'login',
      error: null,
    }),
}));

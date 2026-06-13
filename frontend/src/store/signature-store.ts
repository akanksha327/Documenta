import { create } from 'zustand';
import { useAuthStore } from './auth-store';

export interface SignatureField {
  id: string; // client-side temp UUID or server database ID
  documentId: string;
  userId: string;
  page: number; // 1-indexed
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  width: number; // 0-100 percentage
  height: number; // 0-100 percentage
  type: 'signature' | 'name' | 'date';
  createdAt?: string;
  updatedAt?: string;
}

interface SignatureState {
  fields: SignatureField[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  selectedFieldId: string | null;
  zoom: number; // e.g. 1.0, 1.2, etc.
  currentPage: number;
  totalPages: number;
  activityLog: string[];

  // Actions
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setZoom: (zoom: number) => void;
  setSelectedFieldId: (id: string | null) => void;
  logActivity: (message: string) => void;
  
  // API actions
  fetchFields: (documentId: string) => Promise<void>;
  addField: (documentId: string, type: 'signature' | 'name' | 'date', page: number) => void;
  updateFieldPosition: (id: string, x: number, y: number) => void;
  updateFieldDimensions: (id: string, width: number, height: number) => void;
  deleteField: (id: string) => void;
  saveFields: (documentId: string) => Promise<boolean>;
}

export const useSignatureStore = create<SignatureState>((set, get) => ({
  fields: [],
  isLoading: false,
  isSaving: false,
  error: null,
  selectedFieldId: null,
  zoom: 1.0,
  currentPage: 1,
  totalPages: 1,
  activityLog: ['Editor initialized'],

  setCurrentPage: (currentPage) => set({ currentPage }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedFieldId: (selectedFieldId) => set({ selectedFieldId }),
  
  logActivity: (message) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    set((state) => ({
      activityLog: [`[${time}] ${message}`, ...state.activityLog].slice(0, 50),
    }));
  },

  fetchFields: async (documentId) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/signatures/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve signature fields');
      }

      const fields: SignatureField[] = await res.json();
      set({ fields, isLoading: false });
      get().logActivity(`Loaded ${fields.length} field(s) from server`);
    } catch (err: any) {
      set({ error: err.message || 'Error fetching fields', isLoading: false });
      get().logActivity(`Failed to load fields: ${err.message}`);
    }
  },

  addField: (documentId, type, page) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Default sizes in percentages
    let width = 25; // 25% of page width
    let height = 8;  // 8% of page height
    if (type === 'name') {
      width = 20;
      height = 6;
    } else if (type === 'date') {
      width = 15;
      height = 5;
    }

    // Place near center of page initially
    const newField: SignatureField = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      documentId,
      userId: user.id,
      page,
      x: 35, // 35% from left
      y: 40, // 40% from top
      width,
      height,
      type,
    };

    set((state) => ({
      fields: [...state.fields, newField],
      selectedFieldId: newField.id,
    }));

    get().logActivity(`Added ${type} placeholder on page ${page}`);
  },

  updateFieldPosition: (id, x, y) => {
    set((state) => ({
      fields: state.fields.map((f) =>
        f.id === id
          ? {
              ...f,
              x: Math.max(0, Math.min(100 - f.width, x)),
              y: Math.max(0, Math.min(100 - f.height, y)),
            }
          : f
      ),
    }));
  },

  updateFieldDimensions: (id, width, height) => {
    set((state) => ({
      fields: state.fields.map((f) =>
        f.id === id
          ? {
              ...f,
              width: Math.max(5, Math.min(100 - f.x, width)),
              height: Math.max(2, Math.min(100 - f.y, height)),
            }
          : f
      ),
    }));
  },

  deleteField: (id) => {
    const field = get().fields.find((f) => f.id === id);
    if (!field) return;

    set((state) => ({
      fields: state.fields.filter((f) => f.id !== id),
      selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
    }));

    get().logActivity(`Removed ${field.type} placeholder from page ${field.page}`);
  },

  saveFields: async (documentId) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    set({ isSaving: true, error: null });
    get().logActivity('Saving document layout...');

    try {
      const payload = get().fields.map((f) => ({
        page: f.page,
        x: f.x,
        y: f.y,
        width: f.width,
        height: f.height,
        type: f.type,
      }));

      const res = await fetch('/api/signatures/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentId,
          signatures: payload,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save layout changes');
      }

      // Re-fetch to get database IDs replacing any temp- IDs
      const savedFields: SignatureField[] = await res.json();
      set({ fields: savedFields, isSaving: false });
      get().logActivity('Layout successfully saved to cloud');
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Error saving layout', isSaving: false });
      get().logActivity(`Failed to save layout: ${err.message}`);
      return false;
    }
  },
}));

import { create } from 'zustand';
import { useAuthStore } from './auth-store';

export interface Document {
  id: string;
  ownerId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  status: 'Draft' | 'Pending' | 'Signed' | 'Rejected';
  fileUrl: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
  sharedCount?: number;
  shareToken?: string | null;
}

interface DocumentStats {
  total: number;
  draft: number;
  pending: number;
  signed: number;
  rejected: number;
  sharedLinks: number;
}

interface DocumentState {
  documents: Document[];
  stats: DocumentStats;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  searchQuery: string;
  statusFilter: string; // 'All' | 'Draft' | 'Pending' | 'Signed' | 'Rejected'
  activeDocument: Document | null;

  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: string) => void;
  fetchDocuments: () => Promise<void>;
  fetchDocumentById: (id: string) => Promise<Document | null>;
  uploadDocument: (file: File) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  shareDocument: (id: string) => Promise<string | null>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  stats: { total: 0, draft: 0, pending: 0, signed: 0, rejected: 0, sharedLinks: 0 },
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  searchQuery: '',
  statusFilter: 'All',
  activeDocument: null,

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().fetchDocuments();
  },

  setStatusFilter: (statusFilter) => {
    set({ statusFilter });
    get().fetchDocuments();
  },

  fetchDocuments: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const { statusFilter, searchQuery } = get();
      let url = `/api/docs?status=${statusFilter}`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch documents');
      }

      const documents: Document[] = await res.json();

      // Calculate stats locally from the full set or update stats
      const stats = documents.reduce(
        (acc, doc) => {
          acc.total++;
          const statusKey = doc.status.toLowerCase() as keyof Omit<DocumentStats, 'total' | 'sharedLinks'>;
          if (acc[statusKey] !== undefined) {
            acc[statusKey]++;
          }
          acc.sharedLinks += doc.sharedCount || 0;
          return acc;
        },
        { total: 0, draft: 0, pending: 0, signed: 0, rejected: 0, sharedLinks: 0 }
      );

      // Fetch all documents for stats calculations if a filter is active
      let finalStats = stats;
      if (statusFilter !== 'All' || searchQuery) {
        // Fetch all user documents without filters just to update stats cards
        const allRes = await fetch('/api/docs?status=All', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (allRes.ok) {
          const allDocs: Document[] = await allRes.json();
          finalStats = allDocs.reduce(
            (acc, doc) => {
              acc.total++;
              const statusKey = doc.status.toLowerCase() as keyof Omit<DocumentStats, 'total' | 'sharedLinks'>;
              if (acc[statusKey] !== undefined) {
                acc[statusKey]++;
              }
              acc.sharedLinks += doc.sharedCount || 0;
              return acc;
            },
            { total: 0, draft: 0, pending: 0, signed: 0, rejected: 0, sharedLinks: 0 }
          );
        }
      }

      set({ documents, stats: finalStats, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Something went wrong', isLoading: false });
    }
  },

  fetchDocumentById: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;

    set({ isLoading: true, error: null, activeDocument: null });
    try {
      const res = await fetch(`/api/docs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Document not found');
      }

      const doc: Document = await res.json();
      set({ activeDocument: doc, isLoading: false });
      return doc;
    } catch (err: any) {
      set({ error: err.message || 'Something went wrong', isLoading: false });
      return null;
    }
  },

  uploadDocument: async (file) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    set({ isUploading: true, uploadProgress: 0, error: null });

    try {
      // Setup mock interval progress for visual polish during upload
      const progressInterval = setInterval(() => {
        set((state) => {
          if (state.uploadProgress >= 90) {
            clearInterval(progressInterval);
            return {};
          }
          return { uploadProgress: state.uploadProgress + 10 };
        });
      }, 150);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/docs/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }

      set({ uploadProgress: 100 });
      
      // Delay slightly so 100% state is visible to the user
      await new Promise((r) => setTimeout(r, 300));
      
      set({ isUploading: false, uploadProgress: 0 });
      get().fetchDocuments();
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Upload failed', isUploading: false, uploadProgress: 0 });
      return false;
    }
  },

  deleteDocument: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/docs/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete document');
      }

      set({ isLoading: false });
      get().fetchDocuments();
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Delete failed', isLoading: false });
      return false;
    }
  },

  shareDocument: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/docs/${id}/share`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to generate sharing link');
      }

      const updatedDoc = await res.json();
      
      // Update locally
      set((state) => ({
        documents: state.documents.map((d) => (d.id === id ? { ...d, ...updatedDoc } : d)),
        activeDocument: state.activeDocument?.id === id ? { ...state.activeDocument, ...updatedDoc } : state.activeDocument,
        isLoading: false,
      }));

      // Refresh documents list to pull latest statistics
      get().fetchDocuments();
      return updatedDoc.shareToken;
    } catch (err: any) {
      set({ error: err.message || 'Share failed', isLoading: false });
      return null;
    }
  },
}));

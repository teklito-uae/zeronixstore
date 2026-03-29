import { create } from 'zustand';
import { api } from '../lib/api';

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface ApiCacheState {
  cache: Record<string, CacheEntry>;
  fetchWithCache: (url: string, maxAgeMs?: number) => Promise<any>;
  clearCache: (urlPattern?: string) => void;
}

export const useApiCache = create<ApiCacheState>((set, get) => ({
  cache: {},
  
  fetchWithCache: async (url: string, maxAgeMs = 60 * 1000) => {
    const { cache } = get();
    const now = Date.now();
    const cachedEntry = cache[url];

    // Default maxAge is 60 seconds
    if (cachedEntry && (now - cachedEntry.timestamp < maxAgeMs)) {
      // Simulate an axios response object shape to maintain compatibility
      return { data: cachedEntry.data, isCached: true };
    }

    try {
      const response = await api.get(url);
      set((state) => ({
        cache: {
          ...state.cache,
          [url]: { data: response.data, timestamp: now },
        },
      }));
      return response;
    } catch (error) {
      throw error;
    }
  },

  clearCache: (urlPattern) => {
    if (!urlPattern) {
      set({ cache: {} });
      return;
    }

    set((state) => {
      const newCache = { ...state.cache };
      Object.keys(newCache).forEach(key => {
        if (key.includes(urlPattern)) {
          delete newCache[key];
        }
      });
      return { cache: newCache };
    });
  }
}));

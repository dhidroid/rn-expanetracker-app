import { createClient } from '@supabase/supabase-js';
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env';
import { secureStorage } from '../storage/secureStorage';

const supabaseStorage = {
  getItem: (key: string): Promise<string | null> => {
    const value = secureStorage.getString(key);
    return Promise.resolve(value ?? null);
  },
  setItem: (key: string, value: string): Promise<void> => {
    secureStorage.set(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    secureStorage.delete(key);
    return Promise.resolve();
  },
};

export const supabase = createClient(EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type AuthUser = {
  id: string;
  email: string;
  createdAt: string;
};

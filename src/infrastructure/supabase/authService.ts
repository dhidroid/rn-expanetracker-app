import { supabase, AuthUser } from './client';
import { Session } from '@supabase/supabase-js';

export type { AuthUser };

export type AuthResult = {
  user: AuthUser | null;
  session: Session | null;
  error: string | null;
};

export const AuthService = {
  async signUp(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { user: null, session: null, error: error.message };
      }

      const user = data.user
        ? {
            id: data.user.id,
            email: data.user.email || '',
            createdAt: data.user.created_at,
          }
        : null;

      return { user, session: data.session, error: null };
    } catch (error) {
      return { user: null, session: null, error: (error as Error).message };
    }
  },

  async signInAnonymously(): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        return { user: null, session: null, error: error.message };
      }

      const user = data.user
        ? {
            id: data.user.id,
            email: data.user.email || 'guest@expensetracker.app',
            createdAt: data.user.created_at,
          }
        : null;

      return { user, session: data.session, error: null };
    } catch (error) {
      return { user: null, session: null, error: (error as Error).message };
    }
  },

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('[Auth] Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('[Auth] Sign in error:', error.message);
        return { user: null, session: null, error: error.message };
      }

      console.log('[Auth] Sign in success, user:', data.user?.id);

      const user = data.user
        ? {
            id: data.user.id,
            email: data.user.email || '',
            createdAt: data.user.created_at,
          }
        : null;

      return { user, session: data.session, error: null };
    } catch (error) {
      console.log('[Auth] Sign in exception:', (error as Error).message);
      return { user: null, session: null, error: (error as Error).message };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  async getCurrentSession(): Promise<{
    user: AuthUser | null;
    session: Session | null;
  }> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        return { user: null, session: null };
      }

      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        createdAt: session.user.created_at,
      };

      return { user, session };
    } catch {
      return { user: null, session: null };
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user
        ? {
            id: session.user.id,
            email: session.user.email || '',
            createdAt: session.user.created_at,
          }
        : null;
      callback(user);
    });

    return () => subscription.unsubscribe();
  },
};

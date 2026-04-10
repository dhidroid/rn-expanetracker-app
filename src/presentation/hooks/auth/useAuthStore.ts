import { create } from 'zustand';
import {
  AuthUser,
  AuthService,
} from '../../../infrastructure/supabase/authService';
import {
  SecureStorage,
  SecureStorageKeys,
} from '../../../infrastructure/storage/secureStorage';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInAsGuest: () => Promise<boolean>;
  signOut: () => Promise<void>;
  completeOnboarding: (monthlyIncome: number) => void;
  checkOnboarding: () => boolean;
  setMonthlyIncome: (income: number) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isOnboardingComplete: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const { user, session } = await AuthService.getCurrentSession();

      if (user && session) {
        SecureStorage.setString(SecureStorageKeys.USER_ID, user.id);
        SecureStorage.setString(SecureStorageKeys.USER_EMAIL, user.email);

        const onboardingComplete =
          SecureStorage.getBoolean(SecureStorageKeys.ONBOARDING_COMPLETE) ??
          false;

        set({
          user,
          isAuthenticated: true,
          isOnboardingComplete: onboardingComplete,
          isLoading: false,
        });
      } else {
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  signUp: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    const result = await AuthService.signUp(email, password);

    if (result.user && result.session) {
      SecureStorage.setString(SecureStorageKeys.USER_ID, result.user.id);
      SecureStorage.setString(SecureStorageKeys.USER_EMAIL, result.user.email);
      set({ user: result.user, isLoading: false });
      return true;
    }

    set({ error: result.error, isLoading: false });
    return false;
  },

  signInAsGuest: async () => {
    set({ isLoading: true, error: null });
    const result = await AuthService.signInAnonymously();

    if (result.user && result.session) {
      SecureStorage.setString(SecureStorageKeys.USER_ID, result.user.id);
      SecureStorage.setString(SecureStorageKeys.USER_EMAIL, result.user.email);

      const onboardingComplete =
        SecureStorage.getBoolean(SecureStorageKeys.ONBOARDING_COMPLETE) ??
        false;

      set({
        user: result.user,
        isAuthenticated: true,
        isOnboardingComplete: onboardingComplete,
        isLoading: false,
      });
      return true;
    }

    set({ error: result.error, isLoading: false });
    return false;
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    console.log('[AuthStore] Sign in started for:', email);
    const result = await AuthService.signIn(email, password);
    console.log(
      '[AuthStore] Sign in result:',
      result.user ? 'success' : 'failed',
      result.error,
    );

    if (result.user && result.session) {
      SecureStorage.setString(SecureStorageKeys.USER_ID, result.user.id);
      SecureStorage.setString(SecureStorageKeys.USER_EMAIL, result.user.email);

      const onboardingComplete =
        SecureStorage.getBoolean(SecureStorageKeys.ONBOARDING_COMPLETE) ??
        false;

      set({
        user: result.user,
        isAuthenticated: true,
        isOnboardingComplete: onboardingComplete,
        isLoading: false,
      });
      console.log('[AuthStore] State updated, authenticated:', true);
      return true;
    }

    set({ error: result.error, isLoading: false });
    return false;
  },

  signOut: async () => {
    set({ isLoading: true });
    await AuthService.signOut();
    SecureStorage.clearAll();
    set({
      user: null,
      isAuthenticated: false,
      isOnboardingComplete: false,
      isLoading: false,
    });
  },

  completeOnboarding: (monthlyIncome: number) => {
    SecureStorage.setBoolean(SecureStorageKeys.ONBOARDING_COMPLETE, true);
    SecureStorage.setNumber(SecureStorageKeys.MONTHLY_INCOME, monthlyIncome);
    set({ isOnboardingComplete: true });
  },

  checkOnboarding: () => {
    return (
      SecureStorage.getBoolean(SecureStorageKeys.ONBOARDING_COMPLETE) ?? false
    );
  },

  setMonthlyIncome: (income: number) => {
    SecureStorage.setNumber(SecureStorageKeys.MONTHLY_INCOME, income);
  },

  clearError: () => set({ error: null }),
}));

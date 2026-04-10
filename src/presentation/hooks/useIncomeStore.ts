import { create } from 'zustand';
import { Income, IncomeDTO } from '../../domain/entities';
import { storage } from '../../infrastructure/storage/mmkv';
import {
  SecureStorage,
  SecureStorageKeys,
} from '../../infrastructure/storage/secureStorage';
import { SyncService } from '../../infrastructure/supabase/syncService';
import dayjs from 'dayjs';
import 'react-native-url-polyfill/auto';

const STORAGE_KEY = 'incomes';

const loadFromStorage = (): Income[] => {
  try {
    const raw = storage.getString(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (incomes: Income[]) => {
  storage.set(STORAGE_KEY, JSON.stringify(incomes));
};

interface IncomeState {
  incomes: Income[];
  monthlyIncome: number;
  isLoading: boolean;
  error: string | null;

  loadIncomes: () => void;
  addIncome: (income: IncomeDTO) => void;
  updateIncome: (id: string, income: IncomeDTO) => void;
  removeIncome: (id: string) => void;
  getMonthlyTotal: (year: number, month: number) => number;
  clearError: () => void;
}

export const useIncomeStore = create<IncomeState>((set, get) => ({
  incomes: [],
  monthlyIncome: 0,
  isLoading: false,
  error: null,

  loadIncomes: () => {
    try {
      const incomes = loadFromStorage();
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      // Calculate directly from loaded data (not stale state)
      const monthlyFromRecords = incomes
        .filter(i => {
          const d = dayjs(i.date);
          return d.year() === year && d.month() + 1 === month;
        })
        .reduce((sum, i) => sum + i.amount, 0);

      // Also read onboarding income from SecureStorage as a reference
      const onboardingIncome =
        SecureStorage.getNumber(SecureStorageKeys.MONTHLY_INCOME) || 0;

      // Use whichever is larger (recorded transactions vs onboarding input)
      const monthlyIncome = Math.max(monthlyFromRecords, onboardingIncome);

      set({ incomes, monthlyIncome });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  addIncome: (incomeDTO: IncomeDTO) => {
    const newIncome: Income = {
      ...incomeDTO,
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newIncome, ...get().incomes];
    saveToStorage(updated);
    SyncService.addToPendingIncomesSync(newIncome);
    const now = new Date();
    const monthly = get().getMonthlyTotal(
      now.getFullYear(),
      now.getMonth() + 1,
    );
    set({ incomes: updated, monthlyIncome: monthly });
  },

  updateIncome: (id: string, incomeDTO: IncomeDTO) => {
    const updated = get().incomes.map(i =>
      i.id === id
        ? { ...i, ...incomeDTO, updatedAt: new Date().toISOString() }
        : i,
    );
    saveToStorage(updated);
    const income = updated.find(i => i.id === id);
    if (income) {
      SyncService.addToPendingIncomesSync(income);
    }
    const now = new Date();
    const monthly = get().getMonthlyTotal(
      now.getFullYear(),
      now.getMonth() + 1,
    );
    set({ incomes: updated, monthlyIncome: monthly });
  },

  removeIncome: (id: string) => {
    const updated = get().incomes.filter(i => i.id !== id);
    saveToStorage(updated);
    const now = new Date();
    const monthly = get().getMonthlyTotal(
      now.getFullYear(),
      now.getMonth() + 1,
    );
    set({ incomes: updated, monthlyIncome: monthly });
  },

  getMonthlyTotal: (year: number, month: number) => {
    return get()
      .incomes.filter(i => {
        const d = dayjs(i.date);
        return d.year() === year && d.month() + 1 === month;
      })
      .reduce((sum, i) => sum + i.amount, 0);
  },

  clearError: () => set({ error: null }),
}));

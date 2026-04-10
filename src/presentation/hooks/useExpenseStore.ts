import { create } from 'zustand';
import { Expense, ExpenseCategory, ExpenseDTO } from '../../domain/entities';
import {
  GetAllExpensesUseCase,
  CreateExpenseUseCase,
  UpdateExpenseUseCase,
  DeleteExpenseUseCase,
  GetMonthlyTotalUseCase,
  GetCategoryTotalsUseCase,
} from '../../application/useCases';
import { expenseRepository } from '../../infrastructure/repositories';
import { NotificationService } from '../../infrastructure/notifications/notificationService';
import { SecureStorage, SecureStorageKeys } from '../../infrastructure/storage/secureStorage';

interface ExpenseState {
  expenses: Expense[];
  monthlyTotal: number;
  categoryTotals: Record<ExpenseCategory, number>;
  isLoading: boolean;
  error: string | null;

  loadExpenses: () => Promise<void>;
  loadMonthlyData: (year: number, month: number) => Promise<void>;
  addExpense: (expense: ExpenseDTO) => Promise<void>;
  updateExpense: (id: string, expense: ExpenseDTO) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  clearError: () => void;
}

const getAllExpensesUseCase = new GetAllExpensesUseCase(expenseRepository);
const createExpenseUseCase = new CreateExpenseUseCase(expenseRepository);
const updateExpenseUseCase = new UpdateExpenseUseCase(expenseRepository);
const deleteExpenseUseCase = new DeleteExpenseUseCase(expenseRepository);
const getMonthlyTotalUseCase = new GetMonthlyTotalUseCase(expenseRepository);
const getCategoryTotalsUseCase = new GetCategoryTotalsUseCase(
  expenseRepository,
);

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  monthlyTotal: 0,
  categoryTotals: {
    food: 0,
    transport: 0,
    shopping: 0,
    entertainment: 0,
    bills: 0,
    health: 0,
    education: 0,
    other: 0,
  },
  isLoading: false,
  error: null,

  loadExpenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const expenses = await getAllExpensesUseCase.execute();
      set({ expenses, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  loadMonthlyData: async (year: number, month: number) => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    try {
      const [monthlyTotal, categoryTotals] = await Promise.all([
        getMonthlyTotalUseCase.execute(year, month),
        getCategoryTotalsUseCase.execute(startDate, endDate),
      ]);
      set({ monthlyTotal, categoryTotals });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  addExpense: async (expense: ExpenseDTO) => {
    set({ isLoading: true, error: null });
    try {
      await createExpenseUseCase.execute(expense);
      await get().loadExpenses();
      const now = new Date();
      await get().loadMonthlyData(now.getFullYear(), now.getMonth() + 1);
      // Trigger budget alerts
      const income = SecureStorage.getNumber(SecureStorageKeys.MONTHLY_INCOME) || 0;
      await NotificationService.checkAndNotify(income, get().monthlyTotal);
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  updateExpense: async (id: string, expense: ExpenseDTO) => {
    set({ isLoading: true, error: null });
    try {
      await updateExpenseUseCase.execute(id, expense);
      await get().loadExpenses();
      const now = new Date();
      await get().loadMonthlyData(now.getFullYear(), now.getMonth() + 1);
      // Trigger budget alerts
      const income = SecureStorage.getNumber(SecureStorageKeys.MONTHLY_INCOME) || 0;
      await NotificationService.checkAndNotify(income, get().monthlyTotal);
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  removeExpense: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteExpenseUseCase.execute(id);
      await get().loadExpenses();
      const now = new Date();
      await get().loadMonthlyData(now.getFullYear(), now.getMonth() + 1);
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

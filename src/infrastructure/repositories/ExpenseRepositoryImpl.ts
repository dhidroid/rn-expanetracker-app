import { Expense, ExpenseCategory, ExpenseDTO } from '../../domain/entities';
import { ExpenseRepository } from '../../domain/repositories';
import { storage, StorageKeys } from '../storage';
import { SyncService } from '../supabase/syncService';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getAllExpensesFromStorage(): Expense[] {
  const data = storage.getString(StorageKeys.EXPENSES);
  if (!data) {
    return [];
  }
  try {
    return JSON.parse(data) as Expense[];
  } catch {
    return [];
  }
}

function saveExpensesToStorage(expenses: Expense[]): void {
  storage.set(StorageKeys.EXPENSES, JSON.stringify(expenses));
}

export class ExpenseRepositoryImpl implements ExpenseRepository {
  async getAll(): Promise<Expense[]> {
    return getAllExpensesFromStorage();
  }

  async getById(id: string): Promise<Expense | null> {
    const expenses = getAllExpensesFromStorage();
    return expenses.find(e => e.id === id) || null;
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    const expenses = getAllExpensesFromStorage();
    return expenses.filter(e => e.date >= startDate && e.date <= endDate);
  }

  async getByCategory(category: ExpenseCategory): Promise<Expense[]> {
    const expenses = getAllExpensesFromStorage();
    return expenses.filter(e => e.category === category);
  }

  async create(expenseDTO: ExpenseDTO): Promise<Expense> {
    const expenses = getAllExpensesFromStorage();
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...expenseDTO,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    expenses.push(newExpense);
    saveExpensesToStorage(expenses);
    SyncService.addToPendingSync(newExpense);
    return newExpense;
  }

  async update(id: string, expenseDTO: ExpenseDTO): Promise<Expense> {
    const expenses = getAllExpensesFromStorage();
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Expense with id ${id} not found`);
    }
    const updatedExpense: Expense = {
      ...expenseDTO,
      id,
      createdAt: expenses[index].createdAt,
      updatedAt: new Date().toISOString(),
    };
    expenses[index] = updatedExpense;
    saveExpensesToStorage(expenses);
    SyncService.addToPendingSync(updatedExpense);
    return updatedExpense;
  }

  async delete(id: string): Promise<void> {
    const expenses = getAllExpensesFromStorage();
    const filtered = expenses.filter(e => e.id !== id);
    saveExpensesToStorage(filtered);
  }

  async getMonthlyTotal(year: number, month: number): Promise<number> {
    const expenses = getAllExpensesFromStorage();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    return expenses
      .filter(e => e.date >= startDate && e.date <= endDate)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  async getCategoryTotals(
    startDate: string,
    endDate: string,
  ): Promise<Record<ExpenseCategory, number>> {
    const expenses = getAllExpensesFromStorage();
    const filtered = expenses.filter(
      e => e.date >= startDate && e.date <= endDate,
    );
    const totals: Record<ExpenseCategory, number> = {
      food: 0,
      transport: 0,
      shopping: 0,
      entertainment: 0,
      bills: 0,
      health: 0,
      education: 0,
      other: 0,
    };
    filtered.forEach(e => {
      totals[e.category] += e.amount;
    });
    return totals;
  }
}

export const expenseRepository = new ExpenseRepositoryImpl();

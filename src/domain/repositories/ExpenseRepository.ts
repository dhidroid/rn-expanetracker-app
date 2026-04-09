import { Expense, ExpenseCategory, ExpenseDTO } from '../entities/Expense';

export interface ExpenseRepository {
  getAll(): Promise<Expense[]>;
  getById(id: string): Promise<Expense | null>;
  getByDateRange(startDate: string, endDate: string): Promise<Expense[]>;
  getByCategory(category: ExpenseCategory): Promise<Expense[]>;
  create(expense: ExpenseDTO): Promise<Expense>;
  update(id: string, expense: ExpenseDTO): Promise<Expense>;
  delete(id: string): Promise<void>;
  getMonthlyTotal(year: number, month: number): Promise<number>;
  getCategoryTotals(
    startDate: string,
    endDate: string,
  ): Promise<Record<ExpenseCategory, number>>;
}

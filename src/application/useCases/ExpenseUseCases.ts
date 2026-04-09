import { Expense, ExpenseCategory, ExpenseDTO } from '../../domain/entities';
import { ExpenseRepository } from '../../domain/repositories';

export class GetAllExpensesUseCase {
  constructor(private repository: ExpenseRepository) {}

  async execute(): Promise<Expense[]> {
    const expenses = await this.repository.getAll();
    return expenses.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }
}

export class GetExpenseByIdUseCase {
  constructor(private repository: ExpenseRepository) {}

  async execute(id: string): Promise<Expense | null> {
    return this.repository.getById(id);
  }
}

export class GetExpensesByDateRangeUseCase {
  constructor(private repository: ExpenseRepository) {}

  async execute(startDate: string, endDate: string): Promise<Expense[]> {
    return this.repository.getByDateRange(startDate, endDate);
  }
}

export class CreateExpenseUseCase {
  constructor(private repository: ExpenseRepository) {}

  async execute(expense: ExpenseDTO): Promise<Expense> {
    return this.repository.create(expense);
  }
}

export class UpdateExpenseUseCase {
  constructor(private repository: ExpenseRepository) {}

  async execute(id: string, expense: ExpenseDTO): Promise<Expense> {
    return this.repository.update(id, expense);
  }
}

export class DeleteExpenseUseCase {
  constructor(private repository: ExpenseRepository) {}

  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}

export class GetMonthlyTotalUseCase {
  constructor(private repository: ExpenseRepository) {}

  async execute(year: number, month: number): Promise<number> {
    return this.repository.getMonthlyTotal(year, month);
  }
}

export class GetCategoryTotalsUseCase {
  constructor(private repository: ExpenseRepository) {}

  async execute(
    startDate: string,
    endDate: string,
  ): Promise<Record<ExpenseCategory, number>> {
    return this.repository.getCategoryTotals(startDate, endDate);
  }
}

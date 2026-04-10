export type IncomeSource = 'salary' | 'freelance' | 'investment' | 'business' | 'other';

export interface Income {
  id: string;
  amount: number;
  source: IncomeSource;
  note?: string;
  date: string; // YYYY-MM-DD
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export type IncomeDTO = Omit<Income, 'id' | 'createdAt' | 'updatedAt'>;

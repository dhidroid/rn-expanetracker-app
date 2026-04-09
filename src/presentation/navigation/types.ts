import { Expense } from '../../domain/entities';

export type RootStackParamList = {
  Main: undefined;
  AddExpense: { expense?: Expense } | undefined;
};

export type TabParamList = {
  Home: undefined;
  Analytics: undefined;
  Settings: undefined;
};

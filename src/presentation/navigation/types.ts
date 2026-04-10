import { Expense } from '../../domain/entities';

export type AuthStackParamList = {
  Welcome: undefined;
  OnboardingProfile: undefined;
  Income: undefined;
  Login: undefined;
  Signup: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  AddExpense: { expense?: Expense } | undefined;
  AddIncome: { incomeId?: string } | undefined;
  TransactionDetail: { expense: Expense };
  ServiceDetail: { serviceId: string } | undefined;
};

export type TabParamList = {
  Home: undefined;
  Analytics: undefined;
  Reports: undefined;
  AI: undefined;
  Profile: undefined;
};

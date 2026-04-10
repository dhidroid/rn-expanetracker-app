import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'expense-tracker-storage',
});

export const StorageKeys = {
  EXPENSES: 'expenses',
  SETTINGS: 'settings',
  PENDING_SYNC: 'pending_sync',
  PENDING_INCOMES_SYNC: 'pending_incomes_sync',
} as const;

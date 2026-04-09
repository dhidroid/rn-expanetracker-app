import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'expense-tracker-storage',
});

export const StorageKeys = {
  EXPENSES: 'expenses',
  SETTINGS: 'settings',
} as const;

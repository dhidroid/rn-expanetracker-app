import { MMKV } from 'react-native-mmkv';

export const secureStorage = new MMKV({
  id: 'secure-storage',
  encryptionKey: 'expense-tracker-secure-key-v1',
});

export const SecureStorageKeys = {
  USER_ID: 'user_id',
  USER_EMAIL: 'user_email',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  MONTHLY_INCOME: 'monthly_income',
  LAST_SYNC_DATE: 'last_sync_date',
  PENDING_SYNC: 'pending_sync',
} as const;

export const SecureStorage = {
  setString: (key: string, value: string): void => {
    secureStorage.set(key, value);
  },

  getString: (key: string): string | undefined => {
    return secureStorage.getString(key);
  },

  setNumber: (key: string, value: number): void => {
    secureStorage.set(key, value);
  },

  getNumber: (key: string): number | undefined => {
    return secureStorage.getNumber(key);
  },

  setBoolean: (key: string, value: boolean): void => {
    secureStorage.set(key, value);
  },

  getBoolean: (key: string): boolean | undefined => {
    return secureStorage.getBoolean(key);
  },

  remove: (key: string): void => {
    secureStorage.delete(key);
  },

  clearAll: (): void => {
    secureStorage.clearAll();
  },

  getStorageInfo: () => {
    return {
      usedBytes: secureStorage.size,
      usedKB: (secureStorage.size / 1024).toFixed(2),
      usedMB: (secureStorage.size / (1024 * 1024)).toFixed(2),
    };
  },

  isEncrypted: (): boolean => {
    return secureStorage.contains('encryptionKey');
  },
};

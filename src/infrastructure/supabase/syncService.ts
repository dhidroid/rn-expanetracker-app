import dayjs from 'dayjs';
import { storage, StorageKeys } from '../storage/mmkv';
import { SecureStorage, SecureStorageKeys } from '../storage/secureStorage';
import { supabase } from '../supabase/client';
import { Expense, Income } from '../../domain/entities';

interface StorageInfo {
  usedBytes: number;
  usedKB: string;
  usedMB: string;
  syncStatus: {
    lastSync: string | null;
    pendingItems: number;
    isOnline: boolean;
  };
}

export const SyncService = {
  async syncExpenses(): Promise<{ success: boolean; error?: string }> {
    try {
      const pendingSync = this.getPendingSync();
      if (!pendingSync || pendingSync.length === 0) {
        return { success: true };
      }

      const userId = SecureStorage.getString(SecureStorageKeys.USER_ID);
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const today = dayjs().format('YYYY-MM-DD');

      for (const expense of pendingSync) {
        const { error } = await supabase
          .from('expenses')
          .upsert({
            id: expense.id,
            user_id: userId,
            amount: expense.amount,
            description: expense.note || '',
            category: expense.category,
            date: expense.date,
            created_at: expense.createdAt,
            updated_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          console.error('Sync error:', error);
          return { success: false, error: error.message };
        }
      }

      this.clearPendingSync();
      SecureStorage.setString(SecureStorageKeys.LAST_SYNC_DATE, today);

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async pullRemoteExpenses(): Promise<Expense[]> {
    try {
      const userId = SecureStorage.getString(SecureStorageKeys.USER_ID);
      if (!userId) return [];

      const lastSync = SecureStorage.getString(
        SecureStorageKeys.LAST_SYNC_DATE,
      );
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (lastSync) {
        query = query.gte('date', lastSync);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        amount: row.amount,
        description: row.description,
        category: row.category,
        date: row.date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Pull error:', error);
      return [];
    }
  },

  async syncIncomes(): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = SecureStorage.getString(SecureStorageKeys.USER_ID);
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const pendingSync = this.getPendingIncomesSync();
      if (!pendingSync || pendingSync.length === 0) {
        return { success: true };
      }

      for (const income of pendingSync) {
        const { error } = await supabase
          .from('incomes')
          .upsert({
            id: income.id,
            user_id: userId,
            amount: income.amount,
            source: income.source || '',
            date: income.date,
            created_at: income.createdAt,
            updated_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          console.error('Income sync error:', error);
          return { success: false, error: error.message };
        }
      }

      this.clearPendingIncomesSync();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async pullRemoteIncomes(): Promise<Income[]> {
    try {
      const userId = SecureStorage.getString(SecureStorageKeys.USER_ID);
      if (!userId) return [];

      const lastSync = SecureStorage.getString(
        SecureStorageKeys.LAST_SYNC_DATE,
      );
      let query = supabase
        .from('incomes')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (lastSync) {
        query = query.gte('date', lastSync);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        amount: row.amount,
        source: row.source,
        date: row.date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Pull incomes error:', error);
      return [];
    }
  },

  addToPendingIncomesSync(income: Income): void {
    const pending = this.getPendingIncomesSync();
    pending.push(income);
    storage.set(StorageKeys.PENDING_INCOMES_SYNC, JSON.stringify(pending));
  },

  getPendingIncomesSync(): Income[] {
    const data = storage.getString(StorageKeys.PENDING_INCOMES_SYNC);
    return data ? JSON.parse(data) : [];
  },

  clearPendingIncomesSync(): void {
    storage.delete(StorageKeys.PENDING_INCOMES_SYNC);
  },

  addToPendingSync(expense: Expense): void {
    const pending = this.getPendingSync();
    pending.push(expense);
    storage.set(StorageKeys.PENDING_SYNC, JSON.stringify(pending));
    SecureStorage.setNumber(SecureStorageKeys.PENDING_SYNC, pending.length);
  },

  getPendingSync(): Expense[] {
    const data = storage.getString(StorageKeys.PENDING_SYNC);
    return data ? JSON.parse(data) : [];
  },

  clearPendingSync(): void {
    storage.delete(StorageKeys.PENDING_SYNC);
    SecureStorage.remove(SecureStorageKeys.PENDING_SYNC);
  },

  shouldSyncToday(): boolean {
    const lastSync = SecureStorage.getString(SecureStorageKeys.LAST_SYNC_DATE);
    const today = dayjs().format('YYYY-MM-DD');
    return lastSync !== today;
  },

  async checkOnlineStatus(): Promise<boolean> {
    try {
      const { error } = await supabase.from('expenses').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  },

  getStorageInfo(): StorageInfo {
    let totalSize = 0;

    storage.getAllKeys().forEach(key => {
      const value = storage.getString(key);
      if (value) {
        totalSize += value.length * 2;
      }
    });

    const secureStorageInfo = SecureStorage.getStorageInfo();

    const pendingExpenses = this.getPendingSync().length;
    const pendingIncomes = this.getPendingIncomesSync().length;

    return {
      usedBytes: totalSize + (secureStorageInfo?.usedBytes || 0),
      usedKB: (
        (totalSize + (secureStorageInfo?.usedBytes || 0)) /
        1024
      ).toFixed(2),
      usedMB: (
        (totalSize + (secureStorageInfo?.usedBytes || 0)) /
        (1024 * 1024)
      ).toFixed(2),
      syncStatus: {
        lastSync:
          SecureStorage.getString(SecureStorageKeys.LAST_SYNC_DATE) || null,
        pendingItems: pendingExpenses + pendingIncomes,
        isOnline: false,
      },
    };
  },

  async dailySync(): Promise<void> {
    if (!this.shouldSyncToday()) return;

    const isOnline = await this.checkOnlineStatus();
    if (!isOnline) return;

    await this.syncExpenses();
    await this.syncIncomes();
    await this.pullRemoteExpenses();
    await this.pullRemoteIncomes();
  },
};

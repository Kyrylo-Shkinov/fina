import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction } from '@/types';
import * as db from '@/lib/db';
import { useDateStore } from './useDateStore';

interface TransactionStore {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadTransactions: (month?: number, year?: number) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  getTransactionsByType: (type: 'income' | 'expense' | 'savings') => Transaction[];
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      loading: false,
      error: null,

      loadTransactions: async (month, year) => {
        set({ loading: true, error: null });
        try {
          const dateStore = useDateStore.getState();
          const m = month || dateStore.currentMonth;
          const y = year || dateStore.currentYear;
          const transactions = await db.getTransactions(m, y);
          set({ transactions, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load transactions',
            loading: false 
          });
        }
      },

      addTransaction: async (transactionData) => {
        set({ loading: true, error: null });
        try {
          const newTransaction: Transaction = {
            ...transactionData,
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await db.addTransaction(newTransaction);
          set((state) => ({
            transactions: [...state.transactions, newTransaction],
            loading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add transaction',
            loading: false 
          });
        }
      },

      updateTransaction: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          await db.updateTransaction(id, updates);
          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.id === id ? { ...t, ...updates } : t
            ),
            loading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update transaction',
            loading: false 
          });
        }
      },

      deleteTransaction: async (id) => {
        set({ loading: true, error: null });
        try {
          await db.deleteTransaction(id);
          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
            loading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete transaction',
            loading: false 
          });
        }
      },

      getTransactionsByCategory: (categoryId) => {
        return get().transactions.filter((t) => t.categoryId === categoryId);
      },

      getTransactionsByType: (type: 'income' | 'expense' | 'savings') => {
        return get().transactions.filter((t) => t.type === type);
      },
    }),
    {
      name: 'transaction-storage',
      partialize: (state) => ({
        transactions: state.transactions,
      }),
    }
  )
);


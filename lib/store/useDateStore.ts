import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTransactionStore } from './useTransactionStore';
import { usePlanStore } from './usePlanStore';

interface DateStore {
  currentMonth: number;
  currentYear: number;
  
  // Actions
  setCurrentMonth: (month: number, year: number) => void;
}

export const useDateStore = create<DateStore>()(
  persist(
    (set) => ({
      currentMonth: new Date().getMonth() + 1,
      currentYear: new Date().getFullYear(),
      
      setCurrentMonth: (month, year) => {
        set({ currentMonth: month, currentYear: year });
        
        // Автоматично завантажуємо дані для нового місяця
        const transactionStore = useTransactionStore.getState();
        const planStore = usePlanStore.getState();
        transactionStore.loadTransactions(month, year);
        planStore.loadPlan(month, year);
      },
    }),
    {
      name: 'date-storage',
    }
  )
);


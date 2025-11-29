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

// Функція для безпечного отримання поточної дати (тільки на клієнті)
const getCurrentDate = () => {
  if (typeof window === 'undefined') {
    // На сервері повертаємо фіксовану дату
    return { month: 1, year: 2024 };
  }
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

export const useDateStore = create<DateStore>()(
  persist(
    (set) => {
      const { month, year } = getCurrentDate();
      return {
        currentMonth: month,
        currentYear: year,
        
        setCurrentMonth: (month, year) => {
          set({ currentMonth: month, currentYear: year });
          
          // Автоматично завантажуємо дані для нового місяця
          if (typeof window !== 'undefined') {
            const transactionStore = useTransactionStore.getState();
            const planStore = usePlanStore.getState();
            transactionStore.loadTransactions(month, year);
            planStore.loadPlan(month, year);
          }
        },
      };
    },
    {
      name: 'date-storage',
    }
  )
);


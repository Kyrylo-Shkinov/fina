import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  financialMonthStart: number; // 1-31, за замовчуванням 5
  
  // Actions
  setFinancialMonthStart: (day: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      financialMonthStart: 5, // За замовчуванням 5 число
      
      setFinancialMonthStart: (day) => {
        // Валідація: день має бути від 1 до 31
        const validDay = Math.max(1, Math.min(31, day));
        set({ financialMonthStart: validDay });
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);


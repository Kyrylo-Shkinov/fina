import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Plan, Income, FixedExpense, Category } from '@/types';
import * as db from '@/lib/db';
import { useDateStore } from './useDateStore';

interface PlanStore {
  currentPlan: Plan | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadPlan: (month?: number, year?: number) => Promise<void>;
  savePlan: (plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deletePlan: (month?: number, year?: number) => Promise<void>;
  addIncome: (income: Income) => void;
  removeIncome: (index: number) => void;
  addFixedExpense: (expense: FixedExpense) => void;
  removeFixedExpense: (index: number) => void;
  updateCategoryLimit: (category: Category) => void;
  calculateFreeMoney: () => number;
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      currentPlan: null,
      loading: false,
      error: null,

      loadPlan: async (month, year) => {
        set({ loading: true, error: null });
        try {
          const dateStore = useDateStore.getState();
          const m = month || dateStore.currentMonth;
          const y = year || dateStore.currentYear;
          let plan = await db.getPlan(m, y);
          
          if (!plan) {
            // Створюємо новий план якщо не існує (але не зберігаємо в БД до першого збереження)
            plan = {
              id: `plan_${y}_${m}`,
              month: m,
              year: y,
              incomes: [],
              fixedExpenses: [],
              categoryLimits: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            // Не зберігаємо порожній план в БД - він буде створений при першому savePlan
          }
          
          set({ currentPlan: plan, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load plan',
            loading: false 
          });
        }
      },

      savePlan: async (planData) => {
        set({ loading: true, error: null });
        try {
          const plan: Plan = {
            ...planData,
            id: (planData as any).id || `plan_${planData.year}_${planData.month}`,
            createdAt: (planData as any).createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await db.savePlan(plan);
          set({ currentPlan: plan, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to save plan',
            loading: false 
          });
        }
      },

      deletePlan: async (month, year) => {
        set({ loading: true, error: null });
        try {
          const dateStore = useDateStore.getState();
          const m = month || dateStore.currentMonth;
          const y = year || dateStore.currentYear;
          const plan = await db.getPlan(m, y);
          if (plan) {
            await db.deletePlan(plan.id);
            set({ currentPlan: null, loading: false });
          } else {
            set({ loading: false });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete plan',
            loading: false 
          });
        }
      },

      addIncome: (income) => {
        const plan = get().currentPlan;
        if (plan) {
          set({
            currentPlan: {
              ...plan,
              incomes: [...plan.incomes, income],
            },
          });
        }
      },

      removeIncome: (index) => {
        const plan = get().currentPlan;
        if (plan) {
          set({
            currentPlan: {
              ...plan,
              incomes: plan.incomes.filter((_, i) => i !== index),
            },
          });
        }
      },

      addFixedExpense: (expense) => {
        const plan = get().currentPlan;
        if (plan) {
          set({
            currentPlan: {
              ...plan,
              fixedExpenses: [...plan.fixedExpenses, expense],
            },
          });
        }
      },

      removeFixedExpense: (index) => {
        const plan = get().currentPlan;
        if (plan) {
          set({
            currentPlan: {
              ...plan,
              fixedExpenses: plan.fixedExpenses.filter((_, i) => i !== index),
            },
          });
        }
      },

      updateCategoryLimit: (category) => {
        const plan = get().currentPlan;
        if (plan) {
          const existingIndex = plan.categoryLimits.findIndex(
            (c) => c.id === category.id
          );
          
          if (existingIndex >= 0) {
            const updated = [...plan.categoryLimits];
            updated[existingIndex] = category;
            set({
              currentPlan: {
                ...plan,
                categoryLimits: updated,
              },
            });
          } else {
            set({
              currentPlan: {
                ...plan,
                categoryLimits: [...plan.categoryLimits, category],
              },
            });
          }
        }
      },

      calculateFreeMoney: () => {
        const plan = get().currentPlan;
        if (!plan) return 0;

        const totalIncome = plan.incomes.reduce((sum, i) => sum + i.amount, 0);
        const totalFixed = plan.fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalLimits = plan.categoryLimits.reduce(
          (sum, c) => sum + (c.monthlyLimit || 0),
          0
        );

        return totalIncome - totalFixed - totalLimits;
      },
    }),
    {
      name: 'plan-storage',
      partialize: (state) => ({
        currentPlan: state.currentPlan,
      }),
    }
  )
);


import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category } from '@/types';
import * as db from '@/lib/db';
import { defaultCategories } from '@/lib/data/defaultCategories';

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getCategoriesByType: (type: 'income' | 'expense' | 'savings') => Category[];
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: [],
      loading: false,
      error: null,

      loadCategories: async () => {
        set({ loading: true, error: null });
        try {
          let categories = await db.getCategories();
          
          // Якщо категорій немає - ініціалізуємо базові
          if (categories.length === 0) {
            for (const category of defaultCategories) {
              await db.addCategory(category);
            }
            categories = await db.getCategories();
          }
          
          set({ categories, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load categories',
            loading: false 
          });
        }
      },

      addCategory: async (categoryData) => {
        set({ loading: true, error: null });
        try {
          const newCategory: Category = {
            ...categoryData,
            id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          };
          await db.addCategory(newCategory);
          set((state) => ({
            categories: [...state.categories, newCategory],
            loading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add category',
            loading: false 
          });
        }
      },

      updateCategory: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          await db.updateCategory(id, updates);
          set((state) => ({
            categories: state.categories.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
            loading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update category',
            loading: false 
          });
        }
      },

      deleteCategory: async (id) => {
        set({ loading: true, error: null });
        try {
          await db.deleteCategory(id);
          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
            loading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete category',
            loading: false 
          });
        }
      },

      getCategoryById: (id) => {
        return get().categories.find((c) => c.id === id);
      },

      getCategoriesByType: (type) => {
        return get().categories.filter((c) => c.type === type);
      },
    }),
    {
      name: 'category-storage',
    }
  )
);


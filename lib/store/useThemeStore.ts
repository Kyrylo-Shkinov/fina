import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark', // Темна тема за замовчуванням
      setTheme: (theme) => {
        set({ theme });
        // Застосовуємо тему до документа тільки після монтування
        if (typeof window !== 'undefined') {
          // Використовуємо requestAnimationFrame для безпечного оновлення DOM
          requestAnimationFrame(() => {
            if (document.documentElement) {
              document.documentElement.classList.remove('light', 'dark');
              document.documentElement.classList.add(theme);
            }
          });
        }
      },
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          if (typeof window !== 'undefined') {
            requestAnimationFrame(() => {
              if (document.documentElement) {
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(newTheme);
              }
            });
          }
          return { theme: newTheme };
        });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Застосовуємо тему при завантаженні, але тільки після hydration
        if (state && typeof window !== 'undefined') {
          // Використовуємо setTimeout для затримки після hydration
          setTimeout(() => {
            if (document.documentElement) {
              document.documentElement.classList.remove('light', 'dark');
              document.documentElement.classList.add(state.theme);
            }
          }, 0);
        }
      },
    }
  )
);


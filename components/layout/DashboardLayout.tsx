'use client';

import { useEffect } from 'react';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useThemeStore } from '@/lib/store/useThemeStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Застосовуємо тему при завантаженні
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pl-20">
      {children}
      <BottomNav />
    </div>
  );
}


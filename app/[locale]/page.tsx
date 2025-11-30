'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { defaultLocale, locales } from '@/i18n';

export const dynamic = 'error';

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Визначаємо locale з URL
    const pathLocale = pathname?.split('/')[1];
    
    if (pathLocale && locales.includes(pathLocale as any)) {
      // Якщо locale вже в URL, редиректимо на home
      router.push(`/${pathLocale}/home`);
    } else {
      // Якщо locale немає, визначаємо з localStorage або браузера
      const getLocale = () => {
        if (typeof window !== 'undefined') {
          const savedLocale = localStorage.getItem('locale');
          if (savedLocale && locales.includes(savedLocale as any)) {
            return savedLocale;
          }
          
          const browserLang = navigator.language.split('-')[0];
          if (locales.includes(browserLang as any)) {
            return browserLang;
          }
        }
        return defaultLocale;
      };
      
      const locale = getLocale();
      router.push(`/${locale}/home`);
    }
  }, [router, pathname]);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Завантаження...</p>
      </div>
    </div>
  );
}


'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale, locales } from '@/i18n';

export default function RootPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Визначаємо мову з localStorage або браузера
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
    router.replace(`/${locale}`);
  }, [router]);
  
  // Не рендеримо нічого - просто редирект
  return null;
}


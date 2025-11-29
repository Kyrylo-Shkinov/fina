'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale, locales } from '@/i18n';

export default function RootPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Визначаємо мову з localStorage або браузера
    const getLocale = () => {
      // Перевіряємо localStorage
      if (typeof window !== 'undefined') {
        const savedLocale = localStorage.getItem('locale');
        if (savedLocale && locales.includes(savedLocale as any)) {
          return savedLocale;
        }
        
        // Визначаємо з браузера
        const browserLang = navigator.language.split('-')[0];
        if (locales.includes(browserLang as any)) {
          return browserLang;
        }
      }
      
      // За замовчуванням
      return defaultLocale;
    };
    
    const locale = getLocale();
    router.push(`/${locale}`);
  }, [router]);
  
  // Показуємо loading під час редирекції
  if (!mounted) {
    return null; // Не рендеримо нічого до монтування на клієнті
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


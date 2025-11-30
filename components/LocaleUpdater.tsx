'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { locales } from '@/i18n';

export function LocaleUpdater() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Оновлюємо lang атрибут на основі поточного шляху
    if (typeof window !== 'undefined' && pathname && document.documentElement) {
      const locale = pathname.split('/')[1];
      if (locale && locales.includes(locale as any)) {
        document.documentElement.lang = locale;
      }
    }
  }, [pathname]);

  return null;
}


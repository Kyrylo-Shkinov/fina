'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const dynamic = 'error';

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Витягуємо locale з pathname
    const locale = pathname?.split('/')[1] || 'uk';
    router.replace(`/${locale}/home`);
  }, [router, pathname]);
  
  // Не рендеримо нічого - просто редирект
  return null;
}


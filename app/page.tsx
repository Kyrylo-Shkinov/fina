import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

export default function RootPage() {
  // Для static export просто редиректимо на default locale
  // Клієнтська логіка визначення локалі буде в app/[locale]/page.tsx
  redirect(`/${defaultLocale}`);
}


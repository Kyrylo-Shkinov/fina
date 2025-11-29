import { redirect } from 'next/navigation';

export const dynamic = 'force-static';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Тимчасово: завжди перенаправляємо на dashboard
  // В майбутньому тут буде перевірка авторизації
  // Якщо не авторизований → redirect на /welcome
  // Якщо авторизований → показуємо dashboard
  
  // Зараз просто перенаправляємо на dashboard (Home сторінка)
  redirect(`/${locale}/home`);
}


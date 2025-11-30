import { redirect } from 'next/navigation';

export const dynamic = 'force-static';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Просто редиректимо на home сторінку
  redirect(`/${locale}/home`);
}


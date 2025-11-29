import { redirect } from 'next/navigation';

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Перевірка, чи ми в dev режимі
  if (process.env.NODE_ENV === 'production') {
    redirect('/');
  }

  return <>{children}</>;
}


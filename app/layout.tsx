import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// Root layout для Next.js App Router
// HTML та body рендеряться в app/[locale]/layout.tsx
// Цей layout просто передає children далі
export default function RootLayout({ children }: Props) {
  return children;
}


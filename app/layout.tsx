import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LocaleUpdater } from '@/components/LocaleUpdater';

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Фінансовий Планувальник",
  description: "Платформа для обліку та планування фінансів",
  manifest: "/fina/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Фінансовий Планувальник",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" suppressHydrationWarning className="dark">
      <body className={inter.className}>
        <LocaleUpdater />
        {children}
      </body>
    </html>
  );
}


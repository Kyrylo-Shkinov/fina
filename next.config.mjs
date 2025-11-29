import createNextIntlPlugin from 'next-intl/plugin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static export для GitHub Pages
  basePath: '/fina', // Base path для GitHub Pages (назва репозиторію)
  images: {
    unoptimized: true, // Обов'язково для static export
  },
  trailingSlash: true, // Для GitHub Pages
};

// PWA налаштування
// next-pwa генерує service worker тільки під час production build
// В development режимі sw.js може не існувати - це нормально
// Використовуємо CommonJS require для next-pwa (він не підтримує ES modules)
let config = withNextIntl(nextConfig);

// Додаємо PWA тільки в production
if (process.env.NODE_ENV === 'production') {
  try {
    const withPWA = require('next-pwa')({
      dest: 'public',
      register: true,
      skipWaiting: true,
      runtimeCaching: [], // Без офлайн кешування
      disable: process.env.NODE_ENV === 'development',
    });
    config = withPWA(config);
  } catch (error) {
    // Якщо next-pwa не встановлено або є помилка, продовжуємо без PWA
    console.warn('PWA configuration skipped:', error.message);
  }
}

export default config;


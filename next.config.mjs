import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static export для GitHub Pages
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
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    runtimeCaching: [], // Без офлайн кешування
  });
  config = withPWA(config);
}

export default config;


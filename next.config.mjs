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
// Вимкнуто для GitHub Pages через конфлікти з basePath
// next-pwa може конфліктувати з basePath при static export
let config = withNextIntl(nextConfig);

// PWA тимчасово вимкнено для GitHub Pages
// Якщо потрібно увімкнути, налаштуйте правильно для basePath
// if (process.env.NODE_ENV === 'production' && !process.env.GITHUB_PAGES) {
//   try {
//     const withPWA = require('next-pwa')({
//       dest: 'public',
//       register: true,
//       skipWaiting: true,
//       runtimeCaching: [],
//       disable: process.env.NODE_ENV === 'development',
//     });
//     config = withPWA(config);
//   } catch (error) {
//     console.warn('PWA configuration skipped:', error.message);
//   }
// }

export default config;


import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

// Middleware не працює з static export
// Використовуємо клієнтську редирекцію замість цього
// Для static export middleware вимкнено
export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export const config = {
  // Вимикаємо middleware для static export
  // matcher: [] означає, що middleware не буде виконуватися
  matcher: []
};


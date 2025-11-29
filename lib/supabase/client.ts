import { createClient } from '@supabase/supabase-js';

// Ленива ініціалізація клієнта для уникнення помилок під час SSR
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Під час SSR або якщо змінні не встановлені, повертаємо заглушку
    // Це дозволить додатку скомпілюватися, але операції з БД не працюватимуть
    console.warn('Supabase environment variables are not set. Database operations will fail.');
    // Створюємо клієнт з порожніми значеннями (буде помилка при використанні, але не при імпорті)
    supabaseClient = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key'
    );
    return supabaseClient;
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

// Експортуємо для зворотної сумісності
export const supabase = getSupabaseClient();


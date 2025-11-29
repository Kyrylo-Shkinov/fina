# Налаштування Supabase

## Крок 1: Створити SQL схему

1. Відкрийте Supabase Dashboard: https://supabase.com/dashboard
2. Виберіть ваш проект
3. Перейдіть в **SQL Editor**
4. Відкрийте файл `supabase-schema.sql` з кореня проекту
5. Скопіюйте весь SQL код і виконайте його в SQL Editor
6. Натисніть **Run** або `Ctrl+Enter`

## Крок 2: Перевірити таблиці

Після виконання SQL, перейдіть в **Table Editor** і переконайтеся, що створені таблиці:
- `categories`
- `transactions`
- `plans`

## Крок 3: Налаштувати змінні оточення

Файл `.env.local` вже створено з вашими ключами. Якщо його немає, створіть його в корені проекту:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xtquxnqxreifdwpylvyx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0cXV4bnF4cmVpZmR3cHlsdnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MzQ5ODksImV4cCI6MjA4MDAxMDk4OX0.3JhDO5TXuPS2hB9eMBmRl0v7sKpOt6ofG-hjO4fNBKU
```

## Крок 4: Перезапустити dev сервер

```bash
npm run dev
```

## Важливо!

- Всі дані тепер зберігаються в хмарній БД Supabase
- IndexedDB більше не використовується
- Дані будуть доступні з будь-якого пристрою
- При першому запуску базові категорії будуть створені автоматично

## Troubleshooting

### Помилка "Missing Supabase environment variables"
- Перевірте, що файл `.env.local` існує в корені проекту
- Перезапустіть dev сервер після створення `.env.local`

### Помилка "relation does not exist"
- Переконайтеся, що ви виконали SQL схему в Supabase Dashboard
- Перевірте, що всі таблиці створені в Table Editor

### Дані не зберігаються
- Перевірте консоль браузера на наявність помилок
- Перевірте Network tab в DevTools - чи йдуть запити до Supabase
- Перевірте права доступу в Supabase Dashboard (RLS policies)


# Інструкції для деплою на GitHub Pages

## Передумови

1. ✅ Supabase проект створено та налаштовано
2. ✅ SQL схема виконана в Supabase Dashboard
3. ✅ Локально все працює (`npm run dev`)

## Крок 1: Налаштування GitHub Secrets

1. Відкрийте ваш репозиторій на GitHub
2. Перейдіть в **Settings** → **Secrets and variables** → **Actions**
3. Натисніть **New repository secret**
4. Додайте два secrets:

   **Secret 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://xtquxnqxreifdwpylvyx.supabase.co`

   **Secret 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: ваш anon key з Supabase Dashboard

## Крок 2: Увімкнути GitHub Pages

1. В репозиторії перейдіть в **Settings** → **Pages**
2. В розділі **Source** виберіть **GitHub Actions**
3. Збережіть зміни

## Крок 3: Push коду

```bash
git add .
git commit -m "Configure for GitHub Pages deployment"
git push origin main  # або master
```

## Крок 4: Перевірка деплою

1. Перейдіть в **Actions** вкладку на GitHub
2. Подивіться статус workflow "Deploy to GitHub Pages"
3. Після успішного завершення ваш сайт буде доступний на:
   - `https://username.github.io/repo-name` (якщо репозиторій не в root)
   - `https://username.github.io` (якщо репозиторій `username.github.io`)

## Troubleshooting

### Помилка "Missing Supabase environment variables"
- Перевірте, що secrets додані правильно
- Перевірте назви secrets (мають бути точно `NEXT_PUBLIC_SUPABASE_URL` та `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Помилка "relation does not exist"
- Переконайтеся, що SQL схема виконана в Supabase Dashboard
- Перевірте, що таблиці створені в Table Editor

### Сайт не відкривається
- Перевірте, що GitHub Pages увімкнено
- Перевірте, що workflow завершився успішно
- Зачекайте 1-2 хвилини після деплою (CDN кешування)

### Якщо репозиторій не в root

Якщо ваш репозиторій називається не `username.github.io`, а наприклад `my-budget-app`, то:

1. Додайте в `next.config.mjs`:
   ```javascript
   basePath: '/my-budget-app',
   ```
2. Сайт буде доступний на `https://username.github.io/my-budget-app`

## Локальна перевірка static export

Перед деплоєм можна перевірити локально:

```bash
npm run export
# Відкрийте папку /out в браузері або запустіть локальний сервер
npx serve out
```

## Оновлення сайту

Після кожного push в main/master гілку автоматично запускається деплой.
Просто зробіть commit та push - все інше зробить GitHub Actions!


-- SQL схема для Supabase
-- Виконайте цей SQL в Supabase Dashboard -> SQL Editor

-- Categories таблиця
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'savings')),
  monthly_limit NUMERIC,
  limits_by_period JSONB,
  distribution_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions таблиця
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'savings')),
  amount NUMERIC NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  description TEXT,
  currency TEXT DEFAULT 'UAH',
  status TEXT DEFAULT 'done' CHECK (status IN ('done', 'planned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Індекси для transactions
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Plans таблиця
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  incomes JSONB NOT NULL DEFAULT '[]',
  fixed_expenses JSONB NOT NULL DEFAULT '[]',
  category_limits JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, month)
);

-- Індекс для plans
CREATE INDEX IF NOT EXISTS idx_plans_month_year ON plans(year, month);

-- Функція для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Тригери для автоматичного оновлення updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


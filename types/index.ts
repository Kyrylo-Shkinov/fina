// Основні типи даних для додатку

export type TransactionType = 'income' | 'expense' | 'savings';
export type TransactionStatus = 'planned' | 'done';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  categoryId: string;
  date: string; // ISO date string
  description: string;
  status: TransactionStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type CategoryType = 'income' | 'expense' | 'savings';

export interface Category {
  id: string;
  name: string;
  icon: string; // emoji або іконка
  color: string;
  type: CategoryType; // Окремий тип для категорій (не TransactionType)
  monthlyLimit?: number;
  limitsByPeriod?: PeriodLimit[];
  distributionType?: 'uniform' | 'weighted'; // тип розподілу ліміту
  weights?: number[]; // ваги для періодів (якщо weighted)
}

export interface PeriodLimit {
  periodIndex: number; // 1, 2, 3, 4, 5
  amount: number;
}

export interface Income {
  categoryId: string;
  amount: number;
  description?: string;
}

export interface FixedExpense {
  categoryId: string;
  amount: number;
  description?: string;
}

export interface Plan {
  id: string;
  month: number; // 1-12
  year: number;
  incomes: Income[];
  fixedExpenses: FixedExpense[];
  categoryLimits: Category[];
  freeMoneyLimitId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodStats {
  periodIndex: number;
  limit: number;
  spent: number;
  remaining: number;
}

export interface CategoryStats {
  categoryId: string;
  limit: number;
  spent: number;
  periods: PeriodStats[];
}

// UI Types
export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

export interface SummaryCard {
  title: string;
  amount: number;
  delta?: number;
  currency: string;
}

// API Types (для майбутнього бекенду)
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}


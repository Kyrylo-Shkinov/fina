// Базові/стандартні категорії для ініціалізації
import type { Category } from '@/types';

export const defaultCategories: Category[] = [
  // Витрати
  {
    id: 'cat_food',
    name: 'Харчування',
    icon: '🍔',
    color: '#4CAF50',
    type: 'expense',
  },
  {
    id: 'cat_transport',
    name: 'Транспорт',
    icon: '🚗',
    color: '#2196F3',
    type: 'expense',
  },
  {
    id: 'cat_entertainment',
    name: 'Розваги',
    icon: '🎬',
    color: '#9C27B0',
    type: 'expense',
  },
  {
    id: 'cat_health',
    name: 'Здоров\'я',
    icon: '🏥',
    color: '#F44336',
    type: 'expense',
  },
  {
    id: 'cat_clothing',
    name: 'Одяг',
    icon: '👕',
    color: '#FF9800',
    type: 'expense',
  },
  {
    id: 'cat_utilities',
    name: 'Комунальні послуги',
    icon: '💡',
    color: '#FFC107',
    type: 'expense',
  },
  {
    id: 'cat_education',
    name: 'Освіта',
    icon: '📚',
    color: '#3F51B5',
    type: 'expense',
  },
  {
    id: 'cat_shopping',
    name: 'Покупки',
    icon: '🛒',
    color: '#E91E63',
    type: 'expense',
  },
  {
    id: 'cat_subscriptions',
    name: 'Підписки',
    icon: '📱',
    color: '#00BCD4',
    type: 'expense',
  },
  {
    id: 'cat_other_expense',
    name: 'Інші витрати',
    icon: '📝',
    color: '#9E9E9E',
    type: 'expense',
  },
  
  // Доходи
  {
    id: 'cat_salary',
    name: 'Зарплата',
    icon: '💰',
    color: '#4CAF50',
    type: 'income',
  },
  {
    id: 'cat_freelance',
    name: 'Підробіток',
    icon: '💼',
    color: '#2196F3',
    type: 'income',
  },
  {
    id: 'cat_investment',
    name: 'Інвестиції',
    icon: '📈',
    color: '#4CAF50',
    type: 'income',
  },
  {
    id: 'cat_gift',
    name: 'Подарунки',
    icon: '🎁',
    color: '#E91E63',
    type: 'income',
  },
  {
    id: 'cat_other_income',
    name: 'Інші доходи',
    icon: '💵',
    color: '#9E9E9E',
    type: 'income',
  },
  
  // Відкладання (окремий тип категорій)
  {
    id: 'cat_savings_reserve',
    name: 'Резерв',
    icon: '🏦',
    color: '#1E90FF',
    type: 'savings',
  },
  {
    id: 'cat_savings_goals',
    name: 'Цілі',
    icon: '🎯',
    color: '#1E90FF',
    type: 'savings',
  },
  {
    id: 'cat_savings_emergency',
    name: 'Підтримка',
    icon: '🆘',
    color: '#FF6B6B',
    type: 'savings',
  },
  {
    id: 'cat_savings_vacation',
    name: 'Відпустка',
    icon: '🏖️',
    color: '#4ECDC4',
    type: 'savings',
  },
];


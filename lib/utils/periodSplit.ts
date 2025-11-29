// Алгоритм автоматичного розподілення лімітів на періоди
// Згідно зі специфікацією: рівномірний розподіл з округленням до копійок

import type { PeriodLimit } from '@/types';

export interface SplitOptions {
  limit: number;
  periods: number; // зазвичай 4 або 5
  spent?: number[]; // вже витрачені суми по періодах (опціонально)
  weights?: number[]; // ваги для періодів (опціонально)
}

/**
 * Автоматичний розподіл ліміту на періоди
 * Базовий алгоритм: рівномірний розподіл з округленням до копійок
 */
export function autoSplitLimit(options: SplitOptions): PeriodLimit[] {
  const { limit, periods, spent, weights } = options;

  // Базовий розподіл
  const base = Math.floor((limit / periods) * 100) / 100; // округлення до копійок
  const remainder = Math.round((limit - base * periods) * 100) / 100;

  const result: PeriodLimit[] = [];

  // Якщо є ваги - використовуємо їх
  if (weights && weights.length === periods) {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    for (let i = 0; i < periods; i++) {
      const weightedAmount = Math.floor((limit * weights[i] / totalWeight) * 100) / 100;
      result.push({
        periodIndex: i + 1,
        amount: weightedAmount,
      });
    }
    // Корекція залишку
    const total = result.reduce((sum, p) => sum + p.amount, 0);
    const diff = limit - total;
    if (Math.abs(diff) > 0.01) {
      result[0].amount = Math.round((result[0].amount + diff) * 100) / 100;
    }
  } else {
    // Рівномірний розподіл
    for (let i = 0; i < periods; i++) {
      let amount = base;
      // Розподіляємо залишок по періодах зверху вниз
      if (i < Math.round(remainder * 100)) {
        amount += 0.01;
      }
      result.push({
        periodIndex: i + 1,
        amount: Math.round(amount * 100) / 100,
      });
    }
  }

  // Якщо є інформація про витрати - можна скоригувати
  // (опціонально, для майбутнього розширення)
  if (spent && spent.length === periods) {
    // Можна додати логіку коригування на основі витрат
  }

  return result;
}

/**
 * Перевірка чи сума періодів дорівнює ліміту
 */
export function validateSplit(limit: number, periods: PeriodLimit[]): boolean {
  const total = periods.reduce((sum, p) => sum + p.amount, 0);
  return Math.abs(total - limit) < 0.01; // допускаємо похибку в 1 копійку
}


// Утиліти для розрахунку періодів з урахуванням фінансового місяця та тижнів з неділі

import type { PeriodLimit } from '@/types';

export interface PeriodDateRange {
  start: Date;
  end: Date;
  days: number;
}

/**
 * Отримує діапазон фінансового місяця
 * @param month - місяць (1-12)
 * @param year - рік
 * @param startDay - день початку фінансового місяця (1-31, за замовчуванням 5)
 * @returns Діапазон дат фінансового місяця
 */
export function getFinancialMonthRange(
  month: number,
  year: number,
  startDay: number = 5
): { start: Date; end: Date; days: number } {
  // Початок: startDay число поточного місяця
  const start = new Date(year, month - 1, startDay);
  
  // Кінець: (startDay - 1) число наступного місяця
  const end = new Date(year, month, startDay - 1);
  
  // Кількість днів у фінансовому місяці
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  return { start, end, days };
}

/**
 * Отримує дати періоду (тиждень з неділі) в межах фінансового місяця
 * @param periodIndex - індекс періоду (1, 2, 3, ...)
 * @param month - місяць (1-12)
 * @param year - рік
 * @param financialMonthStart - день початку фінансового місяця
 * @returns Діапазон дат періоду або null якщо період виходить за межі
 */
export function getPeriodDateRange(
  periodIndex: number,
  month: number,
  year: number,
  financialMonthStart: number = 5
): PeriodDateRange | null {
  const { start: monthStart, end: monthEnd } = getFinancialMonthRange(
    month,
    year,
    financialMonthStart
  );
  
  // Знаходимо першу неділю після початку фінансового місяця
  const firstDayOfWeek = monthStart.getDay(); // 0 = неділя, 1 = понеділок, ...
  const firstSunday = firstDayOfWeek === 0
    ? new Date(monthStart)
    : new Date(monthStart);
    firstSunday.setDate(monthStart.getDate() + (7 - firstDayOfWeek));
  
  // Розраховуємо початок періоду (неділя тижня)
  let periodStart = new Date(firstSunday);
  periodStart.setDate(firstSunday.getDate() + (periodIndex - 1) * 7);
  
  // Кінець періоду (субота того ж тижня)
  let periodEnd = new Date(periodStart);
  periodEnd.setDate(periodStart.getDate() + 6);
  
  // Обмежуємо межами фінансового місяця
  if (periodStart < monthStart) {
    periodStart = new Date(monthStart); // Перший період починається з початку фін. місяця
  }
  if (periodEnd > monthEnd) {
    periodEnd = new Date(monthEnd); // Останній період закінчується з кінцем фін. місяця
  }
  
  // Перевірка чи період в межах
  if (periodStart > monthEnd) {
    return null; // Період виходить за межі
  }
  
  const days = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  return { start: periodStart, end: periodEnd, days };
}

/**
 * Отримує всі періоди для фінансового місяця
 */
export function getAllPeriods(
  month: number,
  year: number,
  financialMonthStart: number = 5
): PeriodDateRange[] {
  const periods: PeriodDateRange[] = [];
  let periodIndex = 1;
  
  while (true) {
    const period = getPeriodDateRange(periodIndex, month, year, financialMonthStart);
    if (!period) break;
    periods.push(period);
    periodIndex++;
  }
  
  return periods;
}

/**
 * Визначає поточний період
 */
export function getCurrentPeriod(
  month: number,
  year: number,
  financialMonthStart: number = 5
): number {
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // Визначаємо до якого фінансового місяця належить сьогодні
  let financialMonth = month;
  let financialYear = year;
  
  if (today.getDate() < financialMonthStart) {
    // Якщо сьогодні до startDay - це ще попередній фінансовий місяць
    financialMonth = month === 1 ? 12 : month - 1;
    financialYear = month === 1 ? year - 1 : year;
  }
  
  const { start: monthStart } = getFinancialMonthRange(
    financialMonth,
    financialYear,
    financialMonthStart
  );
  
  // Знаходимо першу неділю після початку фінансового місяця
  const firstDayOfWeek = monthStart.getDay();
  const firstSunday = firstDayOfWeek === 0
    ? new Date(monthStart)
    : new Date(monthStart);
    firstSunday.setDate(monthStart.getDate() + (7 - firstDayOfWeek));
  
  // Якщо сьогодні до першої неділі - це перший період
  if (todayDate < firstSunday) {
    return 1;
  }
  
  // Розраховуємо різницю в днях від першої неділі
  const diffDays = Math.floor(
    (todayDate.getTime() - firstSunday.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const currentPeriod = Math.floor(diffDays / 7) + 1;
  
  return currentPeriod;
}

/**
 * Розподіляє ліміт пропорційно кількості днів у періодах
 */
export function splitLimitByDays(
  limit: number,
  periods: PeriodDateRange[]
): PeriodLimit[] {
  // Рахуємо загальну кількість днів у всіх періодах
  const totalDays = periods.reduce((sum, period) => sum + period.days, 0);
  
  if (totalDays === 0) {
    return [];
  }
  
  // Розподіляємо пропорційно кількості днів
  const result: PeriodLimit[] = [];
  let remaining = limit;
  
  periods.forEach((period, index) => {
    let amount: number;
    if (index === periods.length - 1) {
      // Останній період отримує залишок (щоб сума була точною)
      amount = remaining;
    } else {
      // Пропорційний розподіл
      amount = Math.floor((limit * period.days / totalDays) * 100) / 100;
      remaining -= amount;
    }
    
    result.push({
      periodIndex: index + 1,
      amount: Math.round(amount * 100) / 100,
    });
  });
  
  return result;
}

/**
 * Форматує дату для відображення
 */
export function formatPeriodDate(date: Date): string {
  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'numeric',
  });
}

/**
 * Форматує діапазон дат періоду
 */
export function formatPeriodRange(period: PeriodDateRange): string {
  const startStr = formatPeriodDate(period.start);
  const endStr = formatPeriodDate(period.end);
  return `${startStr} - ${endStr}`;
}


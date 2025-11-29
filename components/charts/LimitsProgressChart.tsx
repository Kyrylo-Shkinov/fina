'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { useTransactionStore } from '@/lib/store/useTransactionStore';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useDateStore } from '@/lib/store/useDateStore';
import {
  getAllPeriods,
  getCurrentPeriod,
  getPeriodDateRange,
  getFinancialMonthRange,
  formatPeriodRange,
} from '@/lib/utils/periodCalculation';
import type { Category } from '@/types';
import { Calendar } from 'lucide-react';

interface LimitsProgressChartProps {
  categories: Category[];
}

const getBarColor = (spent: number, limit: number) => {
  const percentage = (spent / limit) * 100;
  if (percentage >= 100) return 'hsl(var(--destructive))'; // red
  if (percentage >= 80) return 'hsl(var(--chart-2))'; // orange/warn
  return 'hsl(var(--chart-1))'; // green/success
};

export function LimitsProgressChart({ categories }: LimitsProgressChartProps) {
  const { getTransactionsByCategory } = useTransactionStore();
  const { financialMonthStart } = useSettingsStore();
  const { currentMonth, currentYear } = useDateStore();

  const chartData = useMemo(() => {
    const allPeriods = getAllPeriods(currentMonth, currentYear, financialMonthStart);
    const currentPeriodIndex = getCurrentPeriod(currentMonth, currentYear, financialMonthStart);

    return categories
      .filter((cat) => cat.monthlyLimit && cat.monthlyLimit > 0)
      .map((category) => {
        const transactions = getTransactionsByCategory(category.id);
        
        // Загальні витрати за фінансовий місяць
        const { start: monthStart, end: monthEnd } = getFinancialMonthRange(
          currentMonth,
          currentYear,
          financialMonthStart
        );
        
        const totalSpent = transactions
          .filter((t) => {
            const date = new Date(t.date);
            return (
              date >= monthStart &&
              date <= monthEnd &&
              (t.status === 'done' || t.status === 'planned')
            );
          })
          .reduce((sum, t) => sum + t.amount, 0);

        // Витрати по періодах (якщо є періоди)
        const hasPeriods = category.limitsByPeriod && category.limitsByPeriod.length > 0;
        let currentPeriodData = null;

        if (hasPeriods && allPeriods.length > 0) {
          const currentPeriodRange = getPeriodDateRange(
            currentPeriodIndex,
            currentMonth,
            currentYear,
            financialMonthStart
          );

          if (currentPeriodRange) {
            const currentPeriodLimit = category.limitsByPeriod?.find(
              (p) => p.periodIndex === currentPeriodIndex
            );

            if (currentPeriodLimit) {
              const periodSpent = transactions
                .filter((t) => {
                  const date = new Date(t.date);
                  return (
                    date >= currentPeriodRange.start &&
                    date <= currentPeriodRange.end &&
                    (t.status === 'done' || t.status === 'planned')
                  );
                })
                .reduce((sum, t) => sum + t.amount, 0);

              currentPeriodData = {
                periodIndex: currentPeriodIndex,
                spent: periodSpent,
                limit: currentPeriodLimit.amount,
                range: formatPeriodRange(currentPeriodRange),
              };
            }
          }
        }

        return {
          name: `${category.icon} ${category.name}`,
          spent: totalSpent,
          limit: category.monthlyLimit || 0,
          percentage: category.monthlyLimit ? (totalSpent / category.monthlyLimit) * 100 : 0,
          hasPeriods,
          currentPeriodData,
        };
      })
      .sort((a, b) => b.percentage - a.percentage); // Сортуємо за відсотком використання
  }, [categories, getTransactionsByCategory, currentMonth, currentYear, financialMonthStart]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Прогрес лімітів по категоріях</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {chartData.map((item, index) => {
            const percentage = ((item.spent / item.limit) * 100).toFixed(1);
            const remaining = item.limit - item.spent;
            const isOverLimit = item.spent > item.limit;
            
            return (
              <div key={index} className="space-y-3">
                {/* Загальний прогрес */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className={isOverLimit ? 'text-destructive' : 'text-muted-foreground'}>
                      {formatCurrency(item.spent)} / {formatCurrency(item.limit)} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${Math.min(100, (item.spent / item.limit) * 100)}%`,
                        backgroundColor: getBarColor(item.spent, item.limit),
                      }}
                    />
                  </div>
                  {remaining > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Залишилось: {formatCurrency(remaining)}
                    </p>
                  )}
                  {isOverLimit && (
                    <p className="text-xs text-destructive font-semibold">
                      Перевитрата: {formatCurrency(Math.abs(remaining))}
                    </p>
                  )}
                </div>

                {/* Поточний період (якщо є періоди) */}
                {item.hasPeriods && item.currentPeriodData && (
                  <div className="pl-2 border-l-2 border-primary/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Поточний період: {item.currentPeriodData.range}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">
                          Період {item.currentPeriodData.periodIndex}
                        </span>
                        <span className={
                          item.currentPeriodData.spent > item.currentPeriodData.limit
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                        }>
                          {formatCurrency(item.currentPeriodData.spent)} / {formatCurrency(item.currentPeriodData.limit)} (
                          {((item.currentPeriodData.spent / item.currentPeriodData.limit) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${Math.min(100, (item.currentPeriodData.spent / item.currentPeriodData.limit) * 100)}%`,
                            backgroundColor: getBarColor(
                              item.currentPeriodData.spent,
                              item.currentPeriodData.limit
                            ),
                          }}
                        />
                      </div>
                      {item.currentPeriodData.limit - item.currentPeriodData.spent > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Залишилось: {formatCurrency(item.currentPeriodData.limit - item.currentPeriodData.spent)}
                        </p>
                      )}
                      {item.currentPeriodData.spent > item.currentPeriodData.limit && (
                        <p className="text-xs text-destructive font-semibold">
                          Перевитрата: {formatCurrency(item.currentPeriodData.spent - item.currentPeriodData.limit)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


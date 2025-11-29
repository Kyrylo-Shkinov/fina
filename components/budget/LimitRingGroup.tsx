'use client';

import { useMemo } from 'react';
import { LimitRing } from './LimitRing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import type { Category } from '@/types';
import { useTransactionStore } from '@/lib/store/useTransactionStore';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useDateStore } from '@/lib/store/useDateStore';
import { getPeriodDateRange, getFinancialMonthRange } from '@/lib/utils/periodCalculation';
import { formatCurrency } from '@/lib/utils/formatCurrency';

interface LimitRingGroupProps {
  category: Category;
  onClick?: () => void;
  onLongPress?: () => void;
  onShowAll?: () => void;
}

export function LimitRingGroup({
  category,
  onClick,
  onLongPress,
  onShowAll,
}: LimitRingGroupProps) {
  const { getTransactionsByCategory } = useTransactionStore();
  const { financialMonthStart } = useSettingsStore();
  const { currentMonth, currentYear } = useDateStore();
  const transactions = getTransactionsByCategory(category.id);

  // Якщо є періоди - показуємо кілька кілець
  const hasPeriods = category.limitsByPeriod && category.limitsByPeriod.length > 0;
  const monthlyLimit = category.monthlyLimit || 0;

  // Розраховуємо витрати по періодах
  const periodSpent = useMemo(() => {
    if (!hasPeriods) return null;

    const periods: { periodIndex: number; limit: number; spent: number }[] = [];

    category.limitsByPeriod!.forEach((periodLimit) => {
      // Отримуємо діапазон дат періоду
      const periodRange = getPeriodDateRange(
        periodLimit.periodIndex,
        currentMonth,
        currentYear,
        financialMonthStart
      );

      if (!periodRange) {
        periods.push({
          periodIndex: periodLimit.periodIndex,
          limit: periodLimit.amount,
          spent: 0,
        });
        return;
      }

      // Фільтруємо транзакції за періодом
      const periodTransactions = transactions.filter((t) => {
        const date = new Date(t.date);
        return (
          date >= periodRange.start &&
          date <= periodRange.end &&
          (t.status === 'done' || t.status === 'planned')
        );
      });

      const spent = periodTransactions.reduce((sum, t) => sum + t.amount, 0);

      periods.push({
        periodIndex: periodLimit.periodIndex,
        limit: periodLimit.amount,
        spent,
      });
    });

    return periods;
  }, [hasPeriods, category.limitsByPeriod, transactions, currentMonth, currentYear, financialMonthStart]);

  // Загальні витрати за фінансовий місяць
  const totalSpent = useMemo(() => {
    const { start: monthStart, end: monthEnd } = getFinancialMonthRange(
      currentMonth,
      currentYear,
      financialMonthStart
    );
    
    return transactions
      .filter((t) => {
        const date = new Date(t.date);
        return (
          date >= monthStart &&
          date <= monthEnd &&
          (t.status === 'done' || t.status === 'planned')
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonth, currentYear, financialMonthStart]);

  if (hasPeriods && periodSpent) {
    // Показуємо кілька кілець для періодів
    return (
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{category.icon}</span>
              <CardTitle className="text-base">{category.name}</CardTitle>
            </div>
            {onShowAll && (
              <Button variant="ghost" size="sm" onClick={onShowAll}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Місячний ліміт: {formatCurrency(monthlyLimit)} | 
            Витрачено: {formatCurrency(totalSpent)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {periodSpent.map((period) => (
              <div key={period.periodIndex} className="flex flex-col items-center">
                <LimitRing
                  category={{
                    ...category,
                    name: `${period.periodIndex} період`,
                  }}
                  limit={period.limit}
                  onClick={onClick}
                  onLongPress={onLongPress}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(period.spent)} / {formatCurrency(period.limit)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Якщо немає періодів - показуємо одне кільце
  return (
    <LimitRing
      category={category}
      limit={monthlyLimit}
      onClick={onClick}
      onLongPress={onLongPress}
    />
  );
}


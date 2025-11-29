'use client';

import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { LimitRing } from './LimitRing';
import type { Category } from '@/types';
import { useTransactionStore } from '@/lib/store/useTransactionStore';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useDateStore } from '@/lib/store/useDateStore';
import { getPeriodDateRange, getFinancialMonthRange } from '@/lib/utils/periodCalculation';
import { TransactionItem } from '@/components/transactions/TransactionItem';

interface CategoryDetailsModalProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSplitLimit?: () => void;
  onEditLimit?: () => void;
}

export function CategoryDetailsModal({
  category,
  open,
  onOpenChange,
  onSplitLimit,
  onEditLimit,
}: CategoryDetailsModalProps) {
  const { getTransactionsByCategory } = useTransactionStore();
  const { financialMonthStart } = useSettingsStore();
  const { currentMonth, currentYear } = useDateStore();

  const transactions = useMemo(() => {
    if (!category) return [];
    const allTransactions = getTransactionsByCategory(category.id);
    
    // Фільтруємо транзакції за фінансовим місяцем
    const { start: monthStart, end: monthEnd } = getFinancialMonthRange(
      currentMonth,
      currentYear,
      financialMonthStart
    );
    
    return allTransactions.filter((t) => {
      const date = new Date(t.date);
      return date >= monthStart && date <= monthEnd;
    });
  }, [category, getTransactionsByCategory, currentMonth, currentYear, financialMonthStart]);

  const hasPeriods = category?.limitsByPeriod && category.limitsByPeriod.length > 0;

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <DialogTitle>{category.name}</DialogTitle>
              <DialogDescription>
                Місячний ліміт: {formatCurrency(category.monthlyLimit || 0)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Breakdown по періодах */}
          {hasPeriods && category.limitsByPeriod && (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-3">Розбивка по періодах</h3>
                <div className="grid grid-cols-2 gap-3">
                  {category.limitsByPeriod.map((periodLimit) => {
                    // Отримуємо діапазон дат періоду
                    const periodRange = getPeriodDateRange(
                      periodLimit.periodIndex,
                      currentMonth,
                      currentYear,
                      financialMonthStart
                    );

                    const periodTransactions = periodRange
                      ? transactions.filter((t) => {
                          const date = new Date(t.date);
                          return (
                            date >= periodRange.start &&
                            date <= periodRange.end &&
                            (t.status === 'done' || t.status === 'planned')
                          );
                        })
                      : [];

                    const spent = periodTransactions.reduce(
                      (sum, t) => sum + t.amount,
                      0
                    );

                    return (
                      <div key={periodLimit.periodIndex} className="text-center">
                        <LimitRing
                          category={{
                            ...category,
                            name: `${periodLimit.periodIndex} період`,
                          }}
                          limit={periodLimit.amount}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatCurrency(spent)} / {formatCurrency(periodLimit.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Транзакції за категорією */}
          <div>
            <h3 className="text-sm font-semibold mb-3">
              Транзакції ({transactions.length})
            </h3>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Немає транзакцій за цією категорією
              </p>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    categoryName={category.name}
                    categoryIcon={category.icon}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Кнопки дій */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onSplitLimit?.();
                onOpenChange(false);
              }}
            >
              Розбити ліміт
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onEditLimit?.();
                onOpenChange(false);
              }}
            >
              Редагувати ліміт
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


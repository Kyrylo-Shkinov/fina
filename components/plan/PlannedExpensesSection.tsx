'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { usePlanStore } from '@/lib/store/usePlanStore';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { useDateStore } from '@/lib/store/useDateStore';

interface PlannedExpensesSectionProps {
  onShowAll: () => void;
}

export function PlannedExpensesSection({ onShowAll }: PlannedExpensesSectionProps) {
  const { currentPlan } = usePlanStore();
  const { categories } = useCategoryStore();
  const { currentMonth, currentYear } = useDateStore();

  const plannedExpenses = useMemo(() => {
    // Показуємо заплановані витрати тільки якщо план відповідає поточному місяцю/року
    if (!currentPlan || 
        currentPlan.month !== currentMonth || 
        currentPlan.year !== currentYear ||
        !currentPlan.fixedExpenses.length) {
      return [];
    }
    
    return currentPlan.fixedExpenses.map((expense) => {
      const category = categories.find((c) => c.id === expense.categoryId);
      return {
        ...expense,
        categoryName: category?.name || 'Без категорії',
        categoryIcon: category?.icon || '💰',
      };
    });
  }, [currentPlan, categories, currentMonth, currentYear]);

  const totalPlanned = useMemo(() => {
    return plannedExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [plannedExpenses]);

  if (plannedExpenses.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                Заплановані витрати
              </p>
              <p className="text-xs text-muted-foreground">
                {plannedExpenses.length} {plannedExpenses.length === 1 ? 'витрата' : 'витрат'} • {formatCurrency(totalPlanned)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowAll}
            className="flex-shrink-0"
          >
            <span className="hidden sm:inline">Показати всі</span>
            <span className="sm:hidden">Всі</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


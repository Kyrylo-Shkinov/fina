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
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { usePlanStore } from '@/lib/store/usePlanStore';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { useDateStore } from '@/lib/store/useDateStore';
import { Calendar, CheckCircle2 } from 'lucide-react';

interface PlannedExpensesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRealize: (expenseIndex: number) => void;
}

export function PlannedExpensesModal({
  open,
  onOpenChange,
  onRealize,
}: PlannedExpensesModalProps) {
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
    
    return currentPlan.fixedExpenses.map((expense, index) => {
      const category = categories.find((c) => c.id === expense.categoryId);
      return {
        ...expense,
        index,
        categoryName: category?.name || 'Без категорії',
        categoryIcon: category?.icon || '💰',
      };
    });
  }, [currentPlan, categories, currentMonth, currentYear]);

  const totalPlanned = useMemo(() => {
    return plannedExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [plannedExpenses]);

  // Показуємо модальне вікно тільки якщо план відповідає поточному місяцю/року
  if (!currentPlan || 
      currentPlan.month !== currentMonth || 
      currentPlan.year !== currentYear) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Заплановані витрати
          </DialogTitle>
          <DialogDescription>
            Всього: {formatCurrency(totalPlanned)} • {plannedExpenses.length} {plannedExpenses.length === 1 ? 'витрата' : 'витрат'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          {plannedExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Немає запланованих витрат
            </p>
          ) : (
            plannedExpenses.map((expense) => (
              <div
                key={expense.index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors gap-2"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xl flex-shrink-0">{expense.categoryIcon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{expense.categoryName}</p>
                    {expense.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {expense.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold whitespace-nowrap">{formatCurrency(expense.amount)}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onRealize(expense.index);
                      onOpenChange(false);
                    }}
                    className="h-8 px-2 flex-shrink-0"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Реалізувати</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


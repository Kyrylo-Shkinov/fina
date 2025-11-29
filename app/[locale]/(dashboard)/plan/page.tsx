'use client';

export const dynamic = 'error';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { PlanWizard } from '@/components/plan/PlanWizard';
import { usePlanStore } from '@/lib/store/usePlanStore';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { useTransactionStore } from '@/lib/store/useTransactionStore';
import { useDateStore } from '@/lib/store/useDateStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Edit, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { CompactSummaryCards } from '@/components/plan/CompactSummaryCards';
import { BudgetDistributionChart } from '@/components/charts/BudgetDistributionChart';
import { LimitsProgressChart } from '@/components/charts/LimitsProgressChart';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function PlanPage() {
  const locale = useLocale();
  const router = useRouter();
  const {
    currentPlan,
    loadPlan,
    savePlan,
    deletePlan,
    calculateFreeMoney,
  } = usePlanStore();
  const { categories, loadCategories } = useCategoryStore();
  const { loadTransactions, addTransaction } = useTransactionStore();
  const { currentMonth, currentYear, setCurrentMonth } = useDateStore();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadCategories();
    loadPlan();
    loadTransactions();
  }, [loadCategories, loadPlan, loadTransactions]);

  const handleComplete = async (planData: {
    incomes: any[];
    fixedExpenses: any[];
    categoryLimits: any[];
  }) => {
    await savePlan({
      month: currentMonth,
      year: currentYear,
      ...planData,
    });
    setIsCreating(false);
    loadPlan();
  };

  const handleEdit = () => {
    setIsCreating(true);
  };

  const handleDelete = async () => {
    if (confirm('Ви впевнені, що хочете видалити цей план?')) {
      await deletePlan(currentMonth, currentYear);
      loadPlan();
    }
  };

  const handleRealizeExpense = async (expenseIndex: number) => {
    // Перевіряємо, що план відповідає поточному місяцю/року
    if (!currentPlan || 
        currentPlan.month !== currentMonth || 
        currentPlan.year !== currentYear) {
      return;
    }
    
    const expense = currentPlan.fixedExpenses[expenseIndex];
    if (!expense) return;

    try {
      // Створюємо транзакцію з запланованої витрати
      await addTransaction({
        type: 'expense',
        amount: expense.amount,
        categoryId: expense.categoryId,
        date: new Date().toISOString().split('T')[0],
        description: expense.description || '',
        currency: 'UAH',
        status: 'done',
      });

      // Видаляємо витрату з плану
      const { removeFixedExpense } = usePlanStore.getState();
      removeFixedExpense(expenseIndex);
      loadPlan();
      loadTransactions();
    } catch (error) {
      console.error('Failed to realize expense:', error);
    }
  };

  const getInitialData = () => {
    if (!currentPlan) return undefined;
    return {
      incomes: currentPlan.incomes,
      fixedExpenses: currentPlan.fixedExpenses,
      categoryLimits: currentPlan.categoryLimits,
    };
  };

  const freeMoney = calculateFreeMoney();
  const totalIncome = currentPlan?.incomes.reduce((sum, i) => sum + i.amount, 0) || 0;
  const totalFixed = currentPlan?.fixedExpenses.reduce((sum, e) => sum + e.amount, 0) || 0;
  const totalLimits = currentPlan?.categoryLimits.reduce(
    (sum, c) => sum + (c.monthlyLimit || 0),
    0
  ) || 0;

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  if (isCreating) {
    return (
      <div className="container mx-auto px-4 py-6 pb-28 md:pb-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setIsCreating(false)}
            className="mb-4"
          >
            ← Назад
          </Button>
          <h1 className="text-2xl font-bold">Створення плану</h1>
          <p className="text-sm text-muted-foreground">
            {monthNames[currentMonth - 1]} {currentYear}
          </p>
        </div>
        <PlanWizard
          currentMonth={currentMonth}
          currentYear={currentYear}
          initialData={getInitialData()}
          onComplete={handleComplete}
          onCancel={() => setIsCreating(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold truncate">Планування бюджету</h1>
          <p className="text-sm text-muted-foreground">
            {monthNames[currentMonth - 1]} {currentYear}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <CalendarComponent
            month={currentMonth}
            year={currentYear}
            onMonthChange={(month, year) => {
              setCurrentMonth(month, year);
              // Дані завантажуються автоматично через useDateStore
            }}
          />
        </div>
      </div>

      {/* Кнопки редагування та видалення */}
      {currentPlan && (
        <div className="flex gap-2 mb-6">
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Редагувати план
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Видалити план
          </Button>
        </div>
      )}

      {currentPlan ? (
        <div className="space-y-4">
          {/* Компактні підсумкові картки */}
          <CompactSummaryCards
            totalIncome={totalIncome}
            totalFixed={totalFixed}
            totalLimits={totalLimits}
            freeMoney={freeMoney}
          />

          {/* Діаграма розподілу бюджету */}
          <BudgetDistributionChart
            totalIncome={totalIncome}
            totalFixed={totalFixed}
            totalLimits={totalLimits}
            freeMoney={freeMoney}
          />

          {/* Прогрес лімітів по категоріях */}
          {currentPlan.categoryLimits.length > 0 && (
            <LimitsProgressChart categories={currentPlan.categoryLimits} />
          )}

          {/* Деталі плану в акордеоні */}
          <Accordion type="multiple" className="space-y-3">
            {currentPlan.incomes.length > 0 && (
              <AccordionItem value="incomes" className="border rounded-lg px-4 py-1">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">💰</span>
                      <span className="text-sm font-semibold">Доходи</span>
                      <span className="text-xs text-muted-foreground">
                        ({currentPlan.incomes.length})
                      </span>
                    </div>
                    <span className="text-base font-semibold text-chart-1">
                      {formatCurrency(totalIncome)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-1 pb-2">
                    {currentPlan.incomes.map((income, index) => {
                      const category = categories.find((c) => c.id === income.categoryId);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base">{category?.icon || '💰'}</span>
                            <span className="text-sm">{category?.name || 'Без категорії'}</span>
                            {income.description && (
                              <span className="text-xs text-muted-foreground truncate">
                                - {income.description}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-chart-1 flex-shrink-0 ml-2">
                            {formatCurrency(income.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {currentPlan.fixedExpenses.length > 0 && (
              <AccordionItem value="fixed-expenses" className="border rounded-lg px-4 py-1">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">💸</span>
                      <span className="text-sm font-semibold">Фіксовані витрати</span>
                      <span className="text-xs text-muted-foreground">
                        ({currentPlan.fixedExpenses.length})
                      </span>
                    </div>
                    <span className="text-base font-semibold">
                      {formatCurrency(totalFixed)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-1 pb-2">
                    {currentPlan.fixedExpenses.map((expense, index) => {
                      const category = categories.find((c) => c.id === expense.categoryId);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-base flex-shrink-0">{category?.icon || '💰'}</span>
                            <div className="min-w-0 flex-1">
                              <span className="text-sm">{category?.name || 'Без категорії'}</span>
                              {expense.description && (
                                <span className="text-xs text-muted-foreground truncate block">
                                  {expense.description}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm font-semibold">
                              {formatCurrency(expense.amount)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRealizeExpense(index)}
                              className="h-7 px-2"
                              title="Реалізувати витрату"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="space-y-4">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold">
                План ще не створено
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Створіть план бюджету на {monthNames[currentMonth - 1]} {currentYear}, щоб відстежувати доходи, витрати та ліміти
              </p>
              <Button 
                onClick={() => setIsCreating(true)}
                size="lg"
                className="mt-6"
              >
                Створити план
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


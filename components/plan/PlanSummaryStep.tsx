'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import type { Income, FixedExpense, Category } from '@/types';

interface PlanSummaryStepProps {
  incomes: Income[];
  fixedExpenses: FixedExpense[];
  categoryLimits: Category[];
  month: number;
  year: number;
  categories: Category[];
}

const monthNames = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
];

export function PlanSummaryStep({
  incomes,
  fixedExpenses,
  categoryLimits,
  month,
  year,
  categories,
}: PlanSummaryStepProps) {

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalFixedExpenses = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalLimits = categoryLimits.reduce(
    (sum, c) => sum + (c.monthlyLimit || 0),
    0
  );
  const freeMoney = totalIncome - totalFixedExpenses - totalLimits;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Підсумок плану</h2>
        <p className="text-sm text-muted-foreground">
          Перевірте дані перед збереженням плану на {monthNames[month - 1]} {year}
        </p>
      </div>

      {/* Підсумкові картки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Доходи</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-chart-1">
              {formatCurrency(totalIncome)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {incomes.length} {incomes.length === 1 ? 'джерело' : 'джерел'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Фіксовані витрати</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(totalFixedExpenses)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {fixedExpenses.length} {fixedExpenses.length === 1 ? 'витрата' : 'витрат'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ліміти по категоріях</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(totalLimits)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {categoryLimits.length} {categoryLimits.length === 1 ? 'категорія' : 'категорій'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Вільні гроші</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                freeMoney >= 0 ? 'text-success' : 'text-destructive'
              }`}
            >
              {formatCurrency(freeMoney)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {freeMoney >= 0
                ? 'Доступно для непередбачених витрат'
                : 'Недостатньо коштів!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Детальний список */}
      <div className="space-y-4">
        {/* Доходи */}
        {incomes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Доходи</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {incomes.map((income, index) => {
                const category = categories.find((c) => c.id === income.categoryId);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <span>{category?.icon || '💰'}</span>
                      <span>{category?.name || 'Без категорії'}</span>
                    </div>
                    <span className="font-semibold text-chart-1">
                      {formatCurrency(income.amount)}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Фіксовані витрати */}
        {fixedExpenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Фіксовані витрати</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {fixedExpenses.map((expense, index) => {
                const category = categories.find((c) => c.id === expense.categoryId);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <span>{category?.icon || '💰'}</span>
                      <span>{category?.name || 'Без категорії'}</span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Ліміти */}
        {categoryLimits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ліміти по категоріях</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categoryLimits.map((category) => {
                const hasPeriods =
                  category.limitsByPeriod && category.limitsByPeriod.length > 0;
                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                      {hasPeriods && (
                        <span className="text-xs text-muted-foreground">
                          ({category.limitsByPeriod?.length} періодів)
                        </span>
                      )}
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(category.monthlyLimit || 0)}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


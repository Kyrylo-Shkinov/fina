'use client';

import { useState } from 'react';
import { IncomeStep } from './IncomeStep';
import { FixedExpensesStep } from './FixedExpensesStep';
import { CategoryLimitsStep } from './CategoryLimitsStep';
import { PlanSummaryStep } from './PlanSummaryStep';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import type { Income, FixedExpense, Category } from '@/types';

interface PlanWizardProps {
  currentMonth: number;
  currentYear: number;
  initialData?: {
    incomes: Income[];
    fixedExpenses: FixedExpense[];
    categoryLimits: Category[];
  };
  onComplete: (plan: {
    incomes: Income[];
    fixedExpenses: FixedExpense[];
    categoryLimits: Category[];
  }) => void;
  onCancel?: () => void;
}

const STEPS = [
  { id: 'income', title: 'Доходи' },
  { id: 'fixed', title: 'Фіксовані витрати' },
  { id: 'limits', title: 'Ліміти по категоріях' },
  { id: 'summary', title: 'Підсумок' },
] as const;

export function PlanWizard({
  currentMonth,
  currentYear,
  initialData,
  onComplete,
  onCancel,
}: PlanWizardProps) {
  const { categories } = useCategoryStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [incomes, setIncomes] = useState<Income[]>(initialData?.incomes || []);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(
    initialData?.fixedExpenses || []
  );
  const [categoryLimits, setCategoryLimits] = useState<Category[]>(
    initialData?.categoryLimits || []
  );

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete({
      incomes,
      fixedExpenses,
      categoryLimits,
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Income
        return incomes.length > 0;
      case 1: // Fixed expenses
        return true; // Фіксовані витрати не обов'язкові
      case 2: // Category limits
        return true; // Ліміти не обов'язкові
      case 3: // Summary
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <IncomeStep
            incomes={incomes}
            onIncomesChange={setIncomes}
          />
        );
      case 1:
        return (
          <FixedExpensesStep
            fixedExpenses={fixedExpenses}
            onFixedExpensesChange={setFixedExpenses}
          />
        );
      case 2:
        return (
          <CategoryLimitsStep
            categoryLimits={categoryLimits}
            onCategoryLimitsChange={setCategoryLimits}
          />
        );
      case 3:
        return (
          <PlanSummaryStep
            incomes={incomes}
            fixedExpenses={fixedExpenses}
            categoryLimits={categoryLimits}
            month={currentMonth}
            year={currentYear}
            categories={categories}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Прогрес кроків */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 hide-scrollbar">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div
                className={`
                  w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0
                  ${
                    index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index < currentStep
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {index + 1}
              </div>
              <p
                className={`text-xs mt-2 text-center truncate w-full ${
                  index === currentStep
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </p>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 md:mx-2 flex-shrink-0 ${
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Контент кроку */}
      <div className="pb-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {renderStep()}
      </div>

      {/* Навігація */}
      <div className="flex items-center justify-between pt-4 border-t border-border bg-background gap-2">
        <div className="flex-shrink-0">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} size="sm" className="text-xs">
              Скасувати
            </Button>
          )}
        </div>
        <div className="flex gap-2 flex-1 justify-end">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handlePrevious} size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Назад</span>
            </Button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed()} size="sm" className="flex-1 sm:flex-initial min-w-[100px]">
              <span>Далі</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={!canProceed()} size="sm" className="flex-1 sm:flex-initial min-w-[120px]">
              Зберегти план
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


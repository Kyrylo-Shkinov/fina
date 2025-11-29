'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Settings } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { PeriodSplitDialog } from './PeriodSplitDialog';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { autoSplitLimit } from '@/lib/utils/periodSplit';
import { getAllPeriods, splitLimitByDays } from '@/lib/utils/periodCalculation';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useDateStore } from '@/lib/store/useDateStore';
import type { Category, PeriodLimit } from '@/types';

interface CategoryLimitsStepProps {
  categoryLimits: Category[];
  onCategoryLimitsChange: (limits: Category[]) => void;
}

export function CategoryLimitsStep({
  categoryLimits,
  onCategoryLimitsChange,
}: CategoryLimitsStepProps) {
  const { categories } = useCategoryStore();
  const { currentMonth, currentYear } = useDateStore();
  const { financialMonthStart } = useSettingsStore();
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  
  const [newLimit, setNewLimit] = useState({
    categoryId: '',
    amount: '',
    splitIntoPeriods: false,
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAddLimit = () => {
    if (!newLimit.categoryId || !newLimit.amount) return;

    const category = expenseCategories.find((c) => c.id === newLimit.categoryId);
    if (!category) return;

    const limit = parseFloat(newLimit.amount);
    
    // Якщо розбиваємо на періоди - використовуємо пропорційний розподіл по днях
    let limitsByPeriod: PeriodLimit[] | undefined = undefined;
    if (newLimit.splitIntoPeriods) {
      const periods = getAllPeriods(currentMonth, currentYear, financialMonthStart);
      limitsByPeriod = splitLimitByDays(limit, periods);
    }
    
    const categoryWithLimit: Category = {
      ...category,
      monthlyLimit: limit,
      limitsByPeriod,
      distributionType: newLimit.splitIntoPeriods ? 'uniform' : undefined,
    };

    onCategoryLimitsChange([...categoryLimits, categoryWithLimit]);
    setNewLimit({ categoryId: '', amount: '', splitIntoPeriods: false });
  };

  const handleRemoveLimit = (categoryId: string) => {
    onCategoryLimitsChange(categoryLimits.filter((c) => c.id !== categoryId));
  };

  const handleEditPeriods = (category: Category) => {
    setEditingCategory(category);
  };

  const handleSavePeriods = (
    categoryId: string,
    periods: PeriodLimit[],
    distributionType: 'uniform' | 'weighted'
  ) => {
    const updated = categoryLimits.map((c) => {
      if (c.id === categoryId) {
        return {
          ...c,
          limitsByPeriod: periods,
          distributionType,
        };
      }
      return c;
    });
    onCategoryLimitsChange(updated);
    setEditingCategory(null);
  };

  const totalLimits = categoryLimits.reduce(
    (sum, c) => sum + (c.monthlyLimit || 0),
    0
  );

  // Категорії які ще не додані
  const availableCategories = expenseCategories.filter(
    (c) => !categoryLimits.some((cl) => cl.id === c.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Ліміти по категоріях</h2>
        <p className="text-sm text-muted-foreground">
          Встановіть місячні ліміти для категорій витрат
        </p>
      </div>

      {/* Форма додавання ліміту */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limit-category">Категорія *</Label>
              <Select
                value={newLimit.categoryId}
                onValueChange={(value) =>
                  setNewLimit({ ...newLimit, categoryId: value })
                }
              >
                <SelectTrigger id="limit-category">
                  <SelectValue placeholder="Оберіть категорію" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit-amount">Ліміт *</Label>
              <Input
                id="limit-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newLimit.amount}
                onChange={(e) =>
                  setNewLimit({ ...newLimit, amount: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="split-periods">Розбити на періоди</Label>
              <Select
                value={newLimit.splitIntoPeriods ? 'yes' : 'no'}
                onValueChange={(value) =>
                  setNewLimit({ ...newLimit, splitIntoPeriods: value === 'yes' })
                }
              >
                <SelectTrigger id="split-periods">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Ні</SelectItem>
                  <SelectItem value="yes">Так (5 періодів)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleAddLimit}
            disabled={!newLimit.categoryId || !newLimit.amount}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Додати ліміт
          </Button>
        </CardContent>
      </Card>

      {/* Список доданих лімітів */}
      {categoryLimits.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Встановлені ліміти</h3>
            <p className="text-lg font-bold">
              {formatCurrency(totalLimits)}
            </p>
          </div>

          <div className="space-y-2">
            {categoryLimits.map((category) => {
              const hasPeriods = category.limitsByPeriod && category.limitsByPeriod.length > 0;
              return (
                <Card key={category.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{category.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(category.monthlyLimit || 0)}
                            {hasPeriods && (
                              <span className="ml-2">
                                (розбито на {category.limitsByPeriod?.length} періодів)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasPeriods && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditPeriods(category)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLimit(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {categoryLimits.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Ліміти необов&apos;язкові. Можете пропустити цей крок.</p>
        </div>
      )}

      {/* Діалог редагування періодів */}
      {editingCategory && editingCategory.limitsByPeriod && (
        <PeriodSplitDialog
          open={!!editingCategory}
          onOpenChange={(open) => {
            if (!open) setEditingCategory(null);
          }}
          limit={editingCategory.monthlyLimit || 0}
          periods={editingCategory.limitsByPeriod}
          onSave={(periods, distributionType) => {
            if (editingCategory) {
              handleSavePeriods(editingCategory.id, periods, distributionType);
            }
          }}
        />
      )}
    </div>
  );
}


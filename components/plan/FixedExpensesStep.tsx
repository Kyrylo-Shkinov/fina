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
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import type { FixedExpense } from '@/types';

interface FixedExpensesStepProps {
  fixedExpenses: FixedExpense[];
  onFixedExpensesChange: (expenses: FixedExpense[]) => void;
}

export function FixedExpensesStep({
  fixedExpenses,
  onFixedExpensesChange,
}: FixedExpensesStepProps) {
  const { categories } = useCategoryStore();
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  
  const [newExpense, setNewExpense] = useState({
    categoryId: '',
    amount: '',
    description: '',
  });

  const handleAddExpense = () => {
    if (!newExpense.categoryId || !newExpense.amount) return;

    const expense: FixedExpense = {
      categoryId: newExpense.categoryId,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description || undefined,
    };

    onFixedExpensesChange([...fixedExpenses, expense]);
    setNewExpense({ categoryId: '', amount: '', description: '' });
  };

  const handleRemoveExpense = (index: number) => {
    onFixedExpensesChange(fixedExpenses.filter((_, i) => i !== index));
  };

  const totalExpenses = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Фіксовані витрати</h2>
        <p className="text-sm text-muted-foreground">
          Додайте регулярні витрати (комунальні, підписки тощо)
        </p>
      </div>

      {/* Форма додавання витрати */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expense-category">Категорія *</Label>
              <Select
                value={newExpense.categoryId}
                onValueChange={(value) =>
                  setNewExpense({ ...newExpense, categoryId: value })
                }
              >
                <SelectTrigger id="expense-category">
                  <SelectValue placeholder="Оберіть категорію" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
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
              <Label htmlFor="expense-amount">Сума *</Label>
              <Input
                id="expense-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, amount: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-description">Опис</Label>
              <Input
                id="expense-description"
                placeholder="Необов'язково"
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, description: e.target.value })
                }
              />
            </div>
          </div>

          <Button
            onClick={handleAddExpense}
            disabled={!newExpense.categoryId || !newExpense.amount}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Додати витрату
          </Button>
        </CardContent>
      </Card>

      {/* Список доданих витрат */}
      {fixedExpenses.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Додані витрати</h3>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(totalExpenses)}
            </p>
          </div>

          <div className="space-y-2">
            {fixedExpenses.map((expense, index) => {
              const category = expenseCategories.find(
                (c) => c.id === expense.categoryId
              );
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category?.icon || '💰'}</span>
                        <div>
                          <p className="font-medium">
                            {category?.name || 'Без категорії'}
                          </p>
                          {expense.description && (
                            <p className="text-sm text-muted-foreground">
                              {expense.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-semibold">
                          {formatCurrency(expense.amount)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveExpense(index)}
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

      {fixedExpenses.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Фіксовані витрати необов&apos;язкові. Можете пропустити цей крок.</p>
        </div>
      )}
    </div>
  );
}


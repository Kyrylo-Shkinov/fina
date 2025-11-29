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
import type { Income } from '@/types';

interface IncomeStepProps {
  incomes: Income[];
  onIncomesChange: (incomes: Income[]) => void;
}

export function IncomeStep({ incomes, onIncomesChange }: IncomeStepProps) {
  const { categories } = useCategoryStore();
  const incomeCategories = categories.filter((c) => c.type === 'income');
  
  const [newIncome, setNewIncome] = useState({
    categoryId: '',
    amount: '',
    description: '',
  });

  const handleAddIncome = () => {
    if (!newIncome.categoryId || !newIncome.amount) return;

    const income: Income = {
      categoryId: newIncome.categoryId,
      amount: parseFloat(newIncome.amount),
      description: newIncome.description || undefined,
    };

    onIncomesChange([...incomes, income]);
    setNewIncome({ categoryId: '', amount: '', description: '' });
  };

  const handleRemoveIncome = (index: number) => {
    onIncomesChange(incomes.filter((_, i) => i !== index));
  };

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Додайте доходи</h2>
        <p className="text-sm text-muted-foreground">
          Вкажіть очікувані доходи на місяць
        </p>
      </div>

      {/* Форма додавання доходу */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="income-category">Категорія *</Label>
              <Select
                value={newIncome.categoryId}
                onValueChange={(value) =>
                  setNewIncome({ ...newIncome, categoryId: value })
                }
              >
                <SelectTrigger id="income-category">
                  <SelectValue placeholder="Оберіть категорію" />
                </SelectTrigger>
                <SelectContent>
                  {incomeCategories.map((category) => (
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
              <Label htmlFor="income-amount">Сума *</Label>
              <Input
                id="income-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newIncome.amount}
                onChange={(e) =>
                  setNewIncome({ ...newIncome, amount: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="income-description">Опис</Label>
              <Input
                id="income-description"
                placeholder="Необов'язково"
                value={newIncome.description}
                onChange={(e) =>
                  setNewIncome({ ...newIncome, description: e.target.value })
                }
              />
            </div>
          </div>

          <Button
            onClick={handleAddIncome}
            disabled={!newIncome.categoryId || !newIncome.amount}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Додати дохід
          </Button>
        </CardContent>
      </Card>

      {/* Список доданих доходів */}
      {incomes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Додані доходи</h3>
            <p className="text-lg font-bold text-chart-1">
              {formatCurrency(totalIncome)}
            </p>
          </div>

          <div className="space-y-2">
            {incomes.map((income, index) => {
              const category = incomeCategories.find(
                (c) => c.id === income.categoryId
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
                          {income.description && (
                            <p className="text-sm text-muted-foreground">
                              {income.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-semibold text-chart-1">
                          {formatCurrency(income.amount)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveIncome(index)}
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

      {incomes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Додайте хоча б один дохід для продовження</p>
        </div>
      )}
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionTypeSlider } from './TransactionTypeSlider';
import { useTransactionStore } from '@/lib/store/useTransactionStore';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { usePlanStore } from '@/lib/store/usePlanStore';
import { useDateStore } from '@/lib/store/useDateStore';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { useMemo } from 'react';
import type { TransactionType } from '@/types';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'savings']),
  amount: z.number().positive('Сума повинна бути більше 0'),
  categoryId: z.string().min(1, 'Оберіть категорію'),
  date: z.string().min(1, 'Оберіть дату'),
  description: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: TransactionType;
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  defaultType = 'expense',
}: AddTransactionDialogProps) {
  const { addTransaction } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { currentPlan } = usePlanStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlannedExpense, setSelectedPlannedExpense] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedType = watch('type');
  // Для відкладання показуємо категорії типу 'savings', для інших - відповідного типу
  const availableCategories = categories.filter((c) => {
    if (selectedType === 'savings') {
      return c.type === 'savings'; // Відкладання використовує окремі категорії
    }
    return c.type === selectedType;
  });

  const { currentMonth, currentYear } = useDateStore();

  // Заплановані витрати (показуємо тільки для expense та тільки для поточного місяця/року)
  const plannedExpenses = useMemo(() => {
    if (selectedType !== 'expense' || 
        !currentPlan || 
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
  }, [selectedType, currentPlan, categories, currentMonth, currentYear]);

  // Обробка вибору запланованої витрати
  const handleSelectPlannedExpense = (index: number) => {
    const expense = currentPlan?.fixedExpenses[index];
    if (!expense) return;

    setSelectedPlannedExpense(index);
    setValue('type', 'expense');
    setValue('categoryId', expense.categoryId);
    setValue('amount', expense.amount);
    setValue('description', expense.description || '');
    setValue('date', new Date().toISOString().split('T')[0]);
  };

  const onSubmit = async (data: TransactionForm) => {
    setIsSubmitting(true);
    try {
      // Транзакції, додані через FAB, завжди мають статус "done"
      await addTransaction({
        ...data,
        description: data.description || '', // Переконаємося, що description завжди є рядком
        currency: 'UAH',
        status: 'done', // Завжди виконана, бо додається вручну
      });
      
      // Якщо транзакція створена з запланованої витрати, видаляємо її з плану
      if (selectedPlannedExpense !== null && currentPlan) {
        const { removeFixedExpense } = usePlanStore.getState();
        removeFixedExpense(selectedPlannedExpense);
      }
      
      reset();
      setSelectedPlannedExpense(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Додати транзакцію</DialogTitle>
          <DialogDescription>
            Додайте нову транзакцію до вашого бюджету
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Заплановані витрати (тільки для expense) */}
          {plannedExpenses.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Вибрати з запланованих
              </Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {plannedExpenses.map((expense) => (
                  <Card
                    key={expense.index}
                    className={`cursor-pointer transition-colors ${
                      selectedPlannedExpense === expense.index
                        ? 'border-primary bg-primary/10'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleSelectPlannedExpense(expense.index)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-lg flex-shrink-0">{expense.categoryIcon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{expense.categoryName}</p>
                            {expense.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {expense.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-sm font-semibold">{formatCurrency(expense.amount)}</span>
                          {selectedPlannedExpense === expense.index && (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Тип транзакції - слайдер */}
          <div className="space-y-2">
            <Label>Тип транзакції</Label>
            <TransactionTypeSlider
              value={selectedType}
              onValueChange={(value) => {
                setValue('type', value);
                setSelectedPlannedExpense(null); // Скидаємо вибір при зміні типу
              }}
            />
          </div>

          {/* Сума */}
          <div className="space-y-2">
            <Label htmlFor="amount">Сума *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Категорія */}
          <div className="space-y-2">
            <Label htmlFor="category">Категорія *</Label>
            <Select
              onValueChange={(value) => setValue('categoryId', value)}
            >
              <SelectTrigger>
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
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Дата */}
          <div className="space-y-2">
            <Label htmlFor="date">Дата *</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Опис */}
          <div className="space-y-2">
            <Label htmlFor="description">Опис</Label>
            <Textarea
              id="description"
              placeholder="Додайте опис (необов'язково)"
              rows={3}
              {...register('description')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setSelectedPlannedExpense(null);
                onOpenChange(false);
              }}
            >
              Скасувати
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Збереження...' : 'Додати'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


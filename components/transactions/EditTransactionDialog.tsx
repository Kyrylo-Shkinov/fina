'use client';

import { useState, useEffect } from 'react';
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
import type { Transaction, TransactionType } from '@/types';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'savings']),
  amount: z.number().positive('Сума повинна бути більше 0'),
  categoryId: z.string().min(1, 'Оберіть категорію'),
  date: z.string().min(1, 'Оберіть дату'),
  description: z.string().optional(),
  status: z.enum(['planned', 'done']),
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  transaction,
}: EditTransactionDialogProps) {
  const { updateTransaction } = useTransactionStore();
  const { categories } = useCategoryStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
  });

  // Оновлюємо форму коли змінюється транзакція
  useEffect(() => {
    if (transaction) {
      setValue('type', transaction.type);
      setValue('amount', transaction.amount);
      setValue('categoryId', transaction.categoryId);
      setValue('date', transaction.date.split('T')[0]);
      setValue('description', transaction.description || '');
      setValue('status', transaction.status);
    }
  }, [transaction, setValue]);

  const selectedType = watch('type');
  // Для відкладання показуємо категорії типу 'savings', для інших - відповідного типу
  const availableCategories = categories.filter((c) => {
    if (selectedType === 'savings') {
      return c.type === 'savings';
    }
    return c.type === selectedType;
  });

  const onSubmit = async (data: TransactionForm) => {
    if (!transaction) return;
    
    setIsSubmitting(true);
    try {
      await updateTransaction(transaction.id, {
        ...data,
        currency: transaction.currency,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Редагувати транзакцію</DialogTitle>
          <DialogDescription>
            Змініть дані транзакції
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Тип транзакції - слайдер */}
          <div className="space-y-2">
            <Label>Тип транзакції</Label>
            <TransactionTypeSlider
              value={selectedType}
              onValueChange={(value) => setValue('type', value)}
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
              value={watch('categoryId')}
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

          {/* Статус */}
          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select
              value={watch('status')}
              onValueChange={(value) => setValue('status', value as 'planned' | 'done')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="done">Виконано</SelectItem>
                <SelectItem value="planned">Заплановано</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Скасувати
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Збереження...' : 'Зберегти'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

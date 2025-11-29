'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Transaction } from '@/types';

interface TransactionDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  categoryName?: string;
  categoryIcon?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TransactionDetailsModal({
  open,
  onOpenChange,
  transaction,
  categoryName,
  categoryIcon,
  onEdit,
  onDelete,
}: TransactionDetailsModalProps) {
  if (!transaction) return null;

  const isIncome = transaction.type === 'income';
  const isSavings = transaction.type === 'savings';
  const isDone = transaction.status === 'done';

  const handleEdit = () => {
    onEdit?.();
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-3xl">{categoryIcon || '💰'}</span>
            <span>Деталі транзакції</span>
          </DialogTitle>
          <DialogDescription>
            Повна інформація про транзакцію
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Категорія */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Категорія</p>
            <p className="text-lg font-medium">{categoryName || 'Без категорії'}</p>
          </div>

          {/* Сума */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Сума</p>
            <p
              className={cn(
                "text-2xl font-bold",
                isIncome ? "text-chart-1" : isSavings ? "text-primary" : "text-foreground"
              )}
            >
              {isIncome ? '+' : isSavings ? '💾' : '-'}
              {formatCurrency(transaction.amount, transaction.currency)}
            </p>
          </div>

          {/* Тип */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Тип</p>
            <p className="text-lg font-medium">
              {transaction.type === 'income' && 'Дохід'}
              {transaction.type === 'expense' && 'Витрата'}
              {transaction.type === 'savings' && 'Відкладання'}
            </p>
          </div>

          {/* Дата */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Дата</p>
            <p className="text-lg font-medium">
              {new Date(transaction.date).toLocaleDateString('uk-UA', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Статус */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Статус</p>
            <p className="text-lg font-medium">
              {isDone ? (
                <span className="text-success">✓ Виконано</span>
              ) : (
                <span className="text-primary">📅 Заплановано</span>
              )}
            </p>
          </div>

          {/* Опис */}
          {transaction.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Опис</p>
              <p className="text-lg font-medium">{transaction.description}</p>
            </div>
          )}
        </div>

        {/* Кнопки дій */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Видалити
          </Button>
          <Button
            variant="default"
            onClick={handleEdit}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Редагувати
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


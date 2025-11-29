'use client';

import { useState, useRef } from 'react';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { cn } from '@/lib/utils/cn';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/types';

interface TransactionItemProps {
  transaction: Transaction;
  categoryName?: string;
  categoryIcon?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
  onClick?: () => void;
}

export function TransactionItem({
  transaction,
  categoryName,
  categoryIcon,
  onEdit,
  onDelete,
  onToggleStatus,
  onClick,
}: TransactionItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const SWIPE_THRESHOLD = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startX.current;
    const deltaY = Math.abs(touch.clientY - startY.current);

    // Якщо вертикальний скрол більший - не обробляємо swipe
    if (deltaY > 10) {
      setIsSwiping(false);
      setSwipeOffset(0);
      return;
    }

    // Обмежуємо swipe
    const maxSwipe = 120;
    const newOffset = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
    setSwipeOffset(newOffset);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);

    if (Math.abs(swipeOffset) > SWIPE_THRESHOLD) {
      if (swipeOffset < 0) {
        // Swipe left (транзакція зсувається вліво) - кнопка видалення справа
        onDelete?.();
      } else {
        // Swipe right (транзакція зсувається вправо) - кнопка редагування зліва
        onEdit?.();
      }
    }

    // Повертаємо на місце
    setSwipeOffset(0);
  };

  const isIncome = transaction.type === 'income';
  const isSavings = transaction.type === 'savings';
  const isDone = transaction.status === 'done';

  return (
    <div className="relative overflow-hidden">
      {/* Фонові кнопки при swipe - витягуються з протилежного боку */}
      <div className="absolute inset-0 flex">
        {/* Кнопка редагування - витягується зліва при swipe вправо */}
        <div
          className="flex items-center justify-center bg-primary/20 transition-all"
          style={{ 
            width: swipeOffset > 0 ? `${swipeOffset}px` : '0px',
            minWidth: swipeOffset > 0 ? `${swipeOffset}px` : '0px',
            opacity: swipeOffset > SWIPE_THRESHOLD ? 1 : swipeOffset > 0 ? 0.5 : 0,
          }}
        >
          {swipeOffset > 10 && (
            <Edit className="h-5 w-5 text-primary flex-shrink-0" />
          )}
        </div>
        <div className="flex-1" />
        {/* Кнопка видалення - витягується справа при swipe вліво */}
        <div
          className="flex items-center justify-center bg-destructive/20 transition-all"
          style={{ 
            width: swipeOffset < 0 ? `${Math.abs(swipeOffset)}px` : '0px',
            minWidth: swipeOffset < 0 ? `${Math.abs(swipeOffset)}px` : '0px',
            opacity: swipeOffset < -SWIPE_THRESHOLD ? 1 : swipeOffset < 0 ? 0.5 : 0,
          }}
        >
          {swipeOffset < -10 && (
            <Trash2 className="h-5 w-5 text-destructive flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Основна картка */}
      <div
        className={cn(
          "relative flex items-center justify-between p-3 rounded-lg border border-border",
          "bg-card transition-colors cursor-pointer",
          "hover:bg-muted/30 active:bg-muted/40 group",
          isDone && "opacity-60"
        )}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
        onTouchStart={(e) => {
          // Для запланованих транзакцій - long press відмічає як виконану
          if (transaction.status === 'planned') {
            const timeout = setTimeout(() => {
              onToggleStatus?.();
            }, 500); // 500ms для long press

            const handleTouchEnd = () => {
              clearTimeout(timeout);
              document.removeEventListener('touchend', handleTouchEnd);
              document.removeEventListener('touchmove', handleTouchEnd);
            };

            document.addEventListener('touchend', handleTouchEnd, { once: true });
            document.addEventListener('touchmove', handleTouchEnd, { once: true });
          } else {
            // Для звичайних транзакцій - звичайний swipe
            handleTouchStart(e);
          }
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          // Якщо транзакція запланована - клік (ЛКМ) відмічає її як виконану
          if (transaction.status === 'planned') {
            e.stopPropagation();
            onToggleStatus?.();
          } else {
            onClick?.();
          }
        }}
      >
        {/* Іконки для ПК версії */}
        <div className="hidden md:flex items-center gap-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors"
            aria-label="Редагувати"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
            aria-label="Видалити"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{categoryIcon || '💰'}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{categoryName || 'Без категорії'}</p>
            <p className="text-sm text-muted-foreground truncate">
              {transaction.description || 'Без опису'}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
                        <p
                          className={cn(
                            "font-semibold",
                            isIncome ? "text-chart-1" : isSavings ? "text-primary" : "text-foreground"
                          )}
                        >
                          {isIncome ? '+' : isSavings ? '💾' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
          <p className="text-xs text-muted-foreground">
            {new Date(transaction.date).toLocaleDateString('uk-UA', {
              day: '2-digit',
              month: '2-digit',
            })}
          </p>
          {!isDone && (
            <span className="text-xs text-primary font-medium">📅 Заплановано</span>
          )}
        </div>
      </div>
    </div>
  );
}


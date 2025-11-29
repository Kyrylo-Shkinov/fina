'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import type { Category } from '@/types';
import { useTransactionStore } from '@/lib/store/useTransactionStore';

interface LimitRingProps {
  category: Category;
  limit: number;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
}

export function LimitRing({
  category,
  limit,
  onClick,
  onLongPress,
  className,
}: LimitRingProps) {
  const { getTransactionsByCategory } = useTransactionStore();
  const transactions = getTransactionsByCategory(category.id);
  
  const spent = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'done' || t.status === 'planned')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const remaining = limit - spent;
  const isOverLimit = spent > limit;
  const isNearLimit = percentage >= 80 && !isOverLimit;

  // Колір залежно від стану
  const ringColor = isOverLimit
    ? 'text-destructive'
    : isNearLimit
    ? 'text-chart-2' // orange/warn
    : 'text-chart-1'; // green/success

  const circumference = 2 * Math.PI * 45; // радіус 45
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border",
        "cursor-pointer transition-all hover:bg-accent",
        className
      )}
      onClick={(e) => {
        // Не викликаємо onClick якщо був long press
        if ((e.currentTarget as any).__longPressTriggered) {
          (e.currentTarget as any).__longPressTriggered = false;
          return;
        }
        onClick?.(e);
      }}
      onContextMenu={(e) => {
        // Для ПК - правий клік
        e.preventDefault();
        onLongPress?.();
      }}
      onTouchStart={(e) => {
        // Для мобільних - long press
        const element = e.currentTarget;
        let longPressTriggered = false;
        
        const timeout = setTimeout(() => {
          longPressTriggered = true;
          (element as any).__longPressTriggered = true;
          onLongPress?.();
        }, 500); // 500ms для long press

        const handleTouchEnd = () => {
          clearTimeout(timeout);
          if (!longPressTriggered) {
            (element as any).__longPressTriggered = false;
          }
          document.removeEventListener('touchend', handleTouchEnd);
          document.removeEventListener('touchmove', handleTouchEnd);
        };

        document.addEventListener('touchend', handleTouchEnd, { once: true });
        document.addEventListener('touchmove', handleTouchEnd, { once: true });
      }}
    >
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90">
          {/* Фонове кільце */}
          <circle
            cx="48"
            cy="48"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-muted opacity-20"
          />
          {/* Прогрес кільце */}
          <circle
            cx="48"
            cy="48"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("transition-all duration-300", ringColor)}
          />
        </svg>
        {/* Центральний текст */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl">{category.icon}</span>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{category.name}</p>
        <p className={cn(
          "text-xs",
          isOverLimit ? "text-destructive" : "text-muted-foreground"
        )}>
          {formatCurrency(spent)} / {formatCurrency(limit)}
        </p>
        {remaining > 0 && (
          <p className="text-xs text-muted-foreground">
            Залишилось: {formatCurrency(remaining)}
          </p>
        )}
        {isOverLimit && (
          <p className="text-xs text-destructive font-semibold">
            Перевитрата: {formatCurrency(Math.abs(remaining))}
          </p>
        )}
      </div>
    </div>
  );
}


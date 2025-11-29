'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SummaryCardProps {
  title: string;
  amount: number;
  delta?: number;
  currency?: string;
  onClick?: () => void;
  className?: string;
}

export function SummaryCard({
  title,
  amount,
  delta,
  currency = 'UAH',
  onClick,
  className,
}: SummaryCardProps) {
  const isPositive = delta !== undefined && delta >= 0;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:bg-accent",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{formatCurrency(amount, currency)}</p>
            {delta !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-xs",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(delta).toFixed(2)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


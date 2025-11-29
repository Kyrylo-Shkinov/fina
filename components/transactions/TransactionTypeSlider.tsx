'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowDownCircle, ArrowUpCircle, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { TransactionType } from '@/types';

interface TransactionTypeSliderProps {
  value: TransactionType;
  onValueChange: (value: TransactionType) => void;
  className?: string;
}

export function TransactionTypeSlider({
  value,
  onValueChange,
  className,
}: TransactionTypeSliderProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(newValue) => {
        if (newValue) {
          onValueChange(newValue as TransactionType);
        }
      }}
      className={cn("w-full", className)}
    >
      <ToggleGroupItem
        value="expense"
        aria-label="Витрата"
        className="flex-1 flex items-center justify-center gap-2 data-[state=on]:bg-destructive/20 data-[state=on]:text-destructive"
      >
        <ArrowDownCircle className="h-4 w-4" />
        <span>Витрата</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="income"
        aria-label="Дохід"
        className="flex-1 flex items-center justify-center gap-2 data-[state=on]:bg-chart-1/20 data-[state=on]:text-chart-1"
      >
        <ArrowUpCircle className="h-4 w-4" />
        <span>Дохід</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="savings"
        aria-label="Відкладання"
        className="flex-1 flex items-center justify-center gap-2 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
      >
        <PiggyBank className="h-4 w-4" />
        <span>Відкладання</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}


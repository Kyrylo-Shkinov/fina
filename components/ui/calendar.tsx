'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface CalendarProps {
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
  className?: string;
}

const monthNames = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
];

export function Calendar({ month, year, onMonthChange, className }: CalendarProps) {
  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevMonth}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="text-center min-w-[140px]">
        <p className="text-sm font-medium">
          {monthNames[month - 1]} {year}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNextMonth}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}


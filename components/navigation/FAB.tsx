'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface FABProps {
  onClick: () => void;
  className?: string;
}

export function FAB({ onClick, className }: FABProps) {
  return (
    <Button
      size="icon"
      className={cn(
        "fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:hidden",
        "bg-primary hover:bg-primary/90",
        className
      )}
      onClick={onClick}
      aria-label="Додати транзакцію"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}


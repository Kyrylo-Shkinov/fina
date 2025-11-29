'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Scissors, Info } from 'lucide-react';

interface QuickMenuProps {
  children: React.ReactNode;
  onSplitLimit?: () => void;
  onEditLimit?: () => void;
  onDetails?: () => void;
}

export function QuickMenu({
  children,
  onSplitLimit,
  onEditLimit,
  onDetails,
}: QuickMenuProps) {
  return (
    <div className="relative group">
      {children}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onDetails}>
            <Info className="mr-2 h-4 w-4" />
            Деталі категорії
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSplitLimit}>
            <Scissors className="mr-2 h-4 w-4" />
            Розбити ліміт
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEditLimit}>
            <Edit className="mr-2 h-4 w-4" />
            Редагувати ліміт
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}


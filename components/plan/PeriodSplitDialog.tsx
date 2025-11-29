'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { getAllPeriods, splitLimitByDays, formatPeriodRange } from '@/lib/utils/periodCalculation';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useDateStore } from '@/lib/store/useDateStore';
import type { PeriodLimit } from '@/types';

interface PeriodSplitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limit: number;
  periods: PeriodLimit[];
  onSave: (periods: PeriodLimit[], distributionType: 'uniform' | 'weighted') => void;
}

export function PeriodSplitDialog({
  open,
  onOpenChange,
  limit,
  periods: initialPeriods,
  onSave,
}: PeriodSplitDialogProps) {
  const { currentMonth, currentYear } = useDateStore();
  const { financialMonthStart } = useSettingsStore();
  const [distributionType, setDistributionType] = useState<'uniform' | 'weighted'>('uniform');
  const [periods, setPeriods] = useState<PeriodLimit[]>(initialPeriods);
  const [weights, setWeights] = useState<number[]>([]);
  
  // Отримуємо всі періоди для поточного місяця
  const allPeriods = getAllPeriods(currentMonth, currentYear, financialMonthStart);

  useEffect(() => {
    if (open) {
      // Якщо немає періодів - створюємо нові на основі поточного місяця
      if (initialPeriods.length === 0 && allPeriods.length > 0) {
        const splitPeriods = splitLimitByDays(limit, allPeriods);
        setPeriods(splitPeriods);
        setDistributionType('uniform');
      } else {
        setPeriods(initialPeriods);
        if (initialPeriods.length > 0) {
          // Перевіряємо чи це weighted розподіл
          const isWeighted = initialPeriods.some((p, i) => {
            const uniform = limit / initialPeriods.length;
            return Math.abs(p.amount - uniform) > 0.01;
          });
          setDistributionType(isWeighted ? 'weighted' : 'uniform');
        }
      }
    }
  }, [open, initialPeriods, limit, allPeriods]);

  const handleAutoSplit = () => {
    if (distributionType === 'uniform') {
      // Пропорційний розподіл по днях
      const splitPeriods = splitLimitByDays(limit, allPeriods);
      setPeriods(splitPeriods);
    } else {
      // Weighted розподіл (якщо потрібно в майбутньому)
      // Поки що використовуємо пропорційний
      const splitPeriods = splitLimitByDays(limit, allPeriods);
      setPeriods(splitPeriods);
    }
  };

  const handlePeriodChange = (index: number, amount: string) => {
    const newPeriods = [...periods];
    newPeriods[index] = {
      ...newPeriods[index],
      amount: parseFloat(amount) || 0,
    };
    setPeriods(newPeriods);
  };

  const handleWeightChange = (index: number, weight: string) => {
    const newWeights = [...weights];
    newWeights[index] = parseFloat(weight) || 0;
    setWeights(newWeights);
  };

  const totalPeriods = periods.reduce((sum, p) => sum + p.amount, 0);
  const isValid = Math.abs(totalPeriods - limit) < 0.01;

  const handleSave = () => {
    if (isValid) {
      onSave(periods, distributionType);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Розподіл ліміту по періодах</DialogTitle>
          <DialogDescription>
            Налаштуйте розподіл ліміту {formatCurrency(limit)} на періоди
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Тип розподілу */}
          <div className="space-y-2">
            <Label>Тип розподілу</Label>
            <Select
              value={distributionType}
              onValueChange={(value) => {
                setDistributionType(value as 'uniform' | 'weighted');
                if (value === 'uniform') {
                  handleAutoSplit();
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uniform">Рівномірний</SelectItem>
                <SelectItem value="weighted">З вагами</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Автоматичний розподіл */}
          <Button
            variant="outline"
            onClick={handleAutoSplit}
            className="w-full"
          >
            Автоматичний розподіл
          </Button>

          {/* Періоди */}
          <div className="space-y-2">
            <Label>Ліміти по періодах</Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {periods.map((period, index) => {
                const periodRange = allPeriods[index];
                return (
                  <div key={period.periodIndex} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-20 text-sm text-muted-foreground">
                        Період {period.periodIndex}
                      </div>
                      {periodRange && (
                        <div className="text-xs text-muted-foreground flex-1">
                          {formatPeriodRange(periodRange)} ({periodRange.days} дн.)
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {distributionType === 'weighted' && (
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Вага"
                          value={weights[index] || ''}
                          onChange={(e) => handleWeightChange(index, e.target.value)}
                          className="w-24"
                        />
                      )}
                      <Input
                        type="number"
                        step="0.01"
                        value={period.amount}
                        onChange={(e) => handlePeriodChange(index, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Підсумок */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Всього:</span>
              <span
                className={`font-semibold ${
                  isValid ? 'text-success' : 'text-destructive'
                }`}
              >
                {formatCurrency(totalPeriods)} / {formatCurrency(limit)}
              </span>
            </div>
            {!isValid && (
              <p className="text-xs text-destructive mt-1">
                Сума періодів має дорівнювати ліміту
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            Зберегти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


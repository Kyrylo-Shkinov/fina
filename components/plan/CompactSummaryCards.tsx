'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';

interface CompactSummaryCardsProps {
  totalIncome: number;
  totalFixed: number;
  totalLimits: number;
  freeMoney: number;
}

export function CompactSummaryCards({
  totalIncome,
  totalFixed,
  totalLimits,
  freeMoney,
}: CompactSummaryCardsProps) {
  const cards = [
    {
      title: 'Доходи',
      amount: totalIncome,
      icon: TrendingUp,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
    {
      title: 'Фіксовані',
      amount: totalFixed,
      icon: Target,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/30',
    },
    {
      title: 'Ліміти',
      amount: totalLimits,
      icon: Wallet,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Вільні',
      amount: freeMoney,
      icon: TrendingDown,
      color: freeMoney >= 0 ? 'text-chart-4' : 'text-destructive',
      bgColor: freeMoney >= 0 ? 'bg-chart-4/10' : 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1.5">{card.title}</p>
              <p className={`text-base font-semibold ${card.color}`}>
                {formatCurrency(card.amount)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}


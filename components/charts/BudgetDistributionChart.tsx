'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/formatCurrency';

interface BudgetDistributionChartProps {
  totalIncome: number;
  totalFixed: number;
  totalLimits: number;
  freeMoney: number;
}

const COLORS = {
  income: 'hsl(var(--chart-1))', // green - позитивний
  fixed: 'hsl(var(--chart-2))', // orange - попередження
  limits: 'hsl(var(--chart-5))', // purple - нейтральний
  free: 'hsl(var(--chart-4))', // blue - інформаційний
};

export function BudgetDistributionChart({
  totalIncome,
  totalFixed,
  totalLimits,
  freeMoney,
}: BudgetDistributionChartProps) {
  // Виключаємо "Доходи" з діаграми, показуємо тільки розподіл витрат
  const data = [
    { name: 'Фіксовані витрати', value: totalFixed, color: COLORS.fixed },
    { name: 'Ліміти', value: totalLimits, color: COLORS.limits },
    { name: 'Вільні гроші', value: Math.max(0, freeMoney), color: COLORS.free },
  ].filter((item) => item.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="rounded-lg border bg-card p-2.5 shadow-md">
          <p className="text-sm font-semibold">{data.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(data.value)} ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Розподіл бюджету</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative h-[200px] w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={75}
                innerRadius={45}
                fill="#8884d8"
                dataKey="value"
                stroke="none"
                style={{ outline: 'none' }}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    style={{ outline: 'none' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Центральний текст */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-2">
              <p className="text-sm font-semibold leading-tight">{formatCurrency(totalIncome)}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Доходи</p>
            </div>
          </div>
        </div>
        
        {/* Легенда з деталями */}
        <div className="space-y-2">
          {data.map((item) => {
            const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
            return (
              <div key={item.name} className="flex items-center justify-between gap-2 py-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">({percent}%)</span>
                  <span className="text-xs font-medium">{formatCurrency(item.value)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


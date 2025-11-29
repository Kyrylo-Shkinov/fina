'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTransactionStore } from '@/lib/store/useTransactionStore';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { usePlanStore } from '@/lib/store/usePlanStore';
import { SummaryCard } from '@/components/budget/SummaryCard';
import { LimitRingGroup } from '@/components/budget/LimitRingGroup';
import { CategoryDetailsModal } from '@/components/budget/CategoryDetailsModal';
import { QuickMenu } from '@/components/budget/QuickMenu';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { Calendar } from '@/components/ui/calendar';
import { FAB } from '@/components/navigation/FAB';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { MoreVertical } from 'lucide-react';

export default function HomePage() {
  const locale = useLocale();
  const router = useRouter();
  
  const {
    transactions,
    currentMonth,
    currentYear,
    setCurrentMonth,
    loadTransactions,
    getTransactionsByType,
    deleteTransaction,
    updateTransaction,
  } = useTransactionStore();
  
  const { categories, loadCategories } = useCategoryStore();
  const { currentPlan, loadPlan, calculateFreeMoney } = usePlanStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  useEffect(() => {
    loadCategories();
    loadPlan();
    loadTransactions();
  }, [loadCategories, loadPlan, loadTransactions]);

  const incomes = useMemo(() => getTransactionsByType('income'), [getTransactionsByType]);
  const expenses = useMemo(() => getTransactionsByType('expense'), [getTransactionsByType]);

  const totalIncome = useMemo(
    () => incomes.reduce((sum, t) => sum + t.amount, 0),
    [incomes]
  );
  
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, t) => sum + t.amount, 0),
    [expenses]
  );

  const balance = totalIncome - totalExpenses;
  const freeMoney = calculateFreeMoney();

  // Категорії з лімітами для кілець (топ 4-5)
  const categoriesWithLimits = useMemo(() => {
    return categories
      .filter((c) => c.monthlyLimit && c.type === 'expense')
      .slice(0, 5);
  }, [categories]);

  const selectedCategoryData = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.id === selectedCategory);
  }, [selectedCategory, categories]);

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month, year);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsCategoryModalOpen(true);
  };

  const handleCategoryLongPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // QuickMenu відкриється через DropdownMenu
  };

  const handleTransactionDelete = async (transactionId: string) => {
    if (confirm('Ви впевнені, що хочете видалити цю транзакцію?')) {
      await deleteTransaction(transactionId);
    }
  };

  const handleTransactionToggleStatus = async (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (transaction) {
      await updateTransaction(transactionId, {
        status: transaction.status === 'done' ? 'planned' : 'done',
      });
    }
  };

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Header з місяцем */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {monthNames[currentMonth - 1]} {currentYear}
        </h1>
        <Calendar
          month={currentMonth}
          year={currentYear}
          onMonthChange={handleMonthChange}
        />
      </div>

      {/* Summary Cards - горизонтальний скрол на мобільних */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-3 min-w-max md:grid md:grid-cols-4 md:min-w-0">
          <div className="min-w-[160px] md:min-w-0">
            <SummaryCard
              title="Баланс"
              amount={balance}
              currency="UAH"
              onClick={() => {
                // TODO: Відкрити фільтровану сторінку
                router.push(`/${locale}/stats`);
              }}
            />
          </div>
          <div className="min-w-[160px] md:min-w-0">
            <SummaryCard
              title="Доходи"
              amount={totalIncome}
              currency="UAH"
              onClick={() => {
                // TODO: Відкрити фільтровану сторінку
                router.push(`/${locale}/stats?type=income`);
              }}
            />
          </div>
          <div className="min-w-[160px] md:min-w-0">
            <SummaryCard
              title="Витрати"
              amount={totalExpenses}
              currency="UAH"
              onClick={() => {
                // TODO: Відкрити фільтровану сторінку
                router.push(`/${locale}/stats?type=expense`);
              }}
            />
          </div>
          <div className="min-w-[160px] md:min-w-0">
            <SummaryCard
              title="Вільні гроші"
              amount={freeMoney}
              currency="UAH"
              onClick={() => {
                // TODO: Відкрити деталі
                router.push(`/${locale}/plan`);
              }}
            />
          </div>
        </div>
      </div>

      {/* Кільця лімітів */}
      {categoriesWithLimits.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Ліміти по категоріях</h2>
            {categoriesWithLimits.length >= 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/${locale}/categories`)}
              >
                Показати всі
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {categoriesWithLimits.map((category) => (
              <QuickMenu
                key={category.id}
                onDetails={() => handleCategoryClick(category.id)}
                onSplitLimit={() => {
                  router.push(`/${locale}/categories?action=split&category=${category.id}`);
                }}
                onEditLimit={() => {
                  router.push(`/${locale}/categories?action=edit&category=${category.id}`);
                }}
              >
                <LimitRingGroup
                  category={category}
                  onClick={() => handleCategoryClick(category.id)}
                  onLongPress={() => handleCategoryLongPress(category.id)}
                  onShowAll={() => router.push(`/${locale}/categories`)}
                />
              </QuickMenu>
            ))}
          </div>
        </div>
      )}

      {/* Останні транзакції */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Останні транзакції</h2>
          {transactions.length > 10 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${locale}/stats`)}
            >
              Показати всі
            </Button>
          )}
        </div>
        <Card>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Немає транзакцій. Додайте першу транзакцію!
                </p>
                <Button onClick={() => setIsAddTransactionOpen(true)}>
                  Додати транзакцію
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {transactions.slice(0, 10).map((transaction) => {
                  const category = categories.find((c) => c.id === transaction.categoryId);
                  return (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      categoryName={category?.name}
                      categoryIcon={category?.icon}
                      onDelete={() => handleTransactionDelete(transaction.id)}
                      onToggleStatus={() => handleTransactionToggleStatus(transaction.id)}
                      onClick={() => {
                        // TODO: Відкрити деталі транзакції
                        console.log('Transaction details', transaction.id);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Модальні вікна */}
      <CategoryDetailsModal
        category={selectedCategoryData}
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        onSplitLimit={() => {
          if (selectedCategory) {
            router.push(`/${locale}/categories?action=split&category=${selectedCategory}`);
          }
        }}
        onEditLimit={() => {
          if (selectedCategory) {
            router.push(`/${locale}/categories?action=edit&category=${selectedCategory}`);
          }
        }}
      />

      <AddTransactionDialog
        open={isAddTransactionOpen}
        onOpenChange={setIsAddTransactionOpen}
      />

      <FAB onClick={() => setIsAddTransactionOpen(true)} />
    </div>
  );
}

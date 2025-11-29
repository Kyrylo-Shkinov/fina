'use client';

export const dynamic = 'error';

import { useEffect, useMemo, useState } from 'react';
import { useTransactionStore } from '@/lib/store/useTransactionStore';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { usePlanStore } from '@/lib/store/usePlanStore';
import { useDateStore } from '@/lib/store/useDateStore';
import { SummaryCard } from '@/components/budget/SummaryCard';
import { LimitRingGroup } from '@/components/budget/LimitRingGroup';
import { CategoryDetailsModal } from '@/components/budget/CategoryDetailsModal';
import { QuickMenu } from '@/components/budget/QuickMenu';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { EditTransactionDialog } from '@/components/transactions/EditTransactionDialog';
import { TransactionDetailsModal } from '@/components/transactions/TransactionDetailsModal';
import { Calendar } from '@/components/ui/calendar';
import { FAB } from '@/components/navigation/FAB';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlannedExpensesSection } from '@/components/plan/PlannedExpensesSection';
import { PlannedExpensesModal } from '@/components/plan/PlannedExpensesModal';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function HomePage() {
  const locale = useLocale();
  const router = useRouter();
  
  const {
    transactions,
    loadTransactions,
    getTransactionsByType,
    deleteTransaction,
    updateTransaction,
    addTransaction,
  } = useTransactionStore();
  
  const { categories, loadCategories } = useCategoryStore();
  const { currentPlan, loadPlan, calculateFreeMoney } = usePlanStore();
  const { currentMonth, currentYear, setCurrentMonth } = useDateStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [isPlannedExpensesModalOpen, setIsPlannedExpensesModalOpen] = useState(false);

  useEffect(() => {
    loadCategories();
    loadPlan();
    loadTransactions();
  }, [loadCategories, loadPlan, loadTransactions]);

  const incomes = useMemo(() => getTransactionsByType('income'), [getTransactionsByType]);
  const expenses = useMemo(() => getTransactionsByType('expense'), [getTransactionsByType]);
  const savings = useMemo(() => getTransactionsByType('savings'), [getTransactionsByType]);

  const totalIncome = useMemo(
    () => incomes.reduce((sum, t) => sum + t.amount, 0),
    [incomes]
  );
  
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, t) => sum + t.amount, 0),
    [expenses]
  );

  const totalSavings = useMemo(
    () => savings.reduce((sum, t) => sum + t.amount, 0),
    [savings]
  );

  // Баланс = доходи - витрати - відкладання
  const balance = totalIncome - totalExpenses - totalSavings;
  const freeMoney = calculateFreeMoney();

  // Категорії з лімітами для кілець (топ 4-5)
  const categoriesWithLimits = useMemo(() => {
    return categories
      .filter((c) => c.monthlyLimit && c.type === 'expense')
      .slice(0, 5);
  }, [categories]);

  const selectedCategoryData = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.id === selectedCategory) || null;
  }, [selectedCategory, categories]);

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month, year);
    // Дані завантажуються автоматично через useDateStore
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

  const handleTransactionEdit = (transactionId: string) => {
    setEditingTransaction(transactionId);
  };

  const handleTransactionToggleStatus = async (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (transaction) {
      await updateTransaction(transactionId, {
        status: transaction.status === 'done' ? 'planned' : 'done',
      });
    }
  };

  const handleRealizePlannedExpense = async (expenseIndex: number) => {
    // Перевіряємо, що план відповідає поточному місяцю/року
    if (!currentPlan || 
        currentPlan.month !== currentMonth || 
        currentPlan.year !== currentYear) {
      return;
    }
    
    const expense = currentPlan.fixedExpenses[expenseIndex];
    if (!expense) return;

    try {
      // Створюємо транзакцію з запланованої витрати
      await addTransaction({
        type: 'expense',
        amount: expense.amount,
        categoryId: expense.categoryId,
        date: new Date().toISOString().split('T')[0],
        description: expense.description || '',
        currency: 'UAH',
        status: 'done',
      });

      // Видаляємо витрату з плану
      const { removeFixedExpense } = usePlanStore.getState();
      removeFixedExpense(expenseIndex);
      loadPlan();
      loadTransactions();
    } catch (error) {
      console.error('Failed to realize expense:', error);
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
      <div className="overflow-x-auto -mx-4 px-4 hide-scrollbar">
        <div className="flex gap-3 min-w-max md:grid md:grid-cols-5 md:min-w-0">
          <div className="min-w-[160px] md:min-w-0">
            <SummaryCard
              title="Баланс"
              amount={balance}
              currency="UAH"
              onClick={() => {
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
                router.push(`/${locale}/stats?type=expense`);
              }}
            />
          </div>
          <div className="min-w-[160px] md:min-w-0">
            <SummaryCard
              title="Відкладено"
              amount={totalSavings}
              currency="UAH"
              onClick={() => {
                router.push(`/${locale}/stats?type=savings`);
              }}
            />
          </div>
          <div className="min-w-[160px] md:min-w-0">
            <SummaryCard
              title="Вільні гроші"
              amount={freeMoney}
              currency="UAH"
              onClick={() => {
                router.push(`/${locale}/plan`);
              }}
            />
          </div>
        </div>
      </div>

      {/* Заплановані витрати */}
      <PlannedExpensesSection onShowAll={() => setIsPlannedExpensesModalOpen(true)} />

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
                      onEdit={() => handleTransactionEdit(transaction.id)}
                      onToggleStatus={() => handleTransactionToggleStatus(transaction.id)}
                      onClick={() => {
                        setSelectedTransaction(transaction.id);
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

      <EditTransactionDialog
        open={editingTransaction !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTransaction(null);
        }}
        transaction={transactions.find((t) => t.id === editingTransaction) || null}
      />

      <TransactionDetailsModal
        open={selectedTransaction !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTransaction(null);
        }}
        transaction={transactions.find((t) => t.id === selectedTransaction) || null}
        categoryName={categories.find((c) => c.id === transactions.find((t) => t.id === selectedTransaction)?.categoryId)?.name}
        categoryIcon={categories.find((c) => c.id === transactions.find((t) => t.id === selectedTransaction)?.categoryId)?.icon}
        onEdit={() => {
          if (selectedTransaction) {
            setSelectedTransaction(null);
            handleTransactionEdit(selectedTransaction);
          }
        }}
        onDelete={() => {
          if (selectedTransaction) {
            handleTransactionDelete(selectedTransaction);
          }
        }}
      />

      <FAB onClick={() => setIsAddTransactionOpen(true)} />

      <PlannedExpensesModal
        open={isPlannedExpensesModalOpen}
        onOpenChange={setIsPlannedExpensesModalOpen}
        onRealize={handleRealizePlannedExpense}
      />
    </div>
  );
}


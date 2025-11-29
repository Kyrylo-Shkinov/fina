// Supabase wrapper для хмарного зберігання
import { supabase } from '@/lib/supabase/client';
import type { Transaction, Category, Plan } from '@/types';

// Transactions CRUD
export async function getTransactions(
  month?: number,
  year?: number
): Promise<Transaction[]> {
  try {
    let query = supabase.from('transactions').select('*');

    if (month && year) {
      // Фільтрація по місяцю та року
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      query = query
        .gte('date', startDate)
        .lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    // Маппимо category_id -> categoryId для сумісності
    return (data || []).map((t: any) => {
      const { category_id, ...rest } = t;
      return {
        ...rest,
        categoryId: category_id,
      } as Transaction;
    });
  } catch (error) {
    console.error('Failed to get transactions:', error);
    return [];
  }
}

export async function addTransaction(transaction: Transaction): Promise<void> {
  try {
    const { error } = await supabase.from('transactions').insert({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      category_id: transaction.categoryId,
      date: transaction.date,
      description: transaction.description || '',
      currency: transaction.currency || 'UAH',
      status: transaction.status || 'done',
      created_at: transaction.createdAt || new Date().toISOString(),
      updated_at: transaction.updatedAt || new Date().toISOString(),
    });

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to add transaction:', error);
    throw error;
  }
}

export async function updateTransaction(
  id: string,
  updates: Partial<Transaction>
): Promise<void> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to update transaction:', error);
    throw error;
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    throw error;
  }
}

// Categories CRUD
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    // Маппимо limits_by_period якщо воно є
    return (data || []).map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon || '💰',
      color: c.color || '#000000',
      type: c.type,
      monthlyLimit: c.monthly_limit ? Number(c.monthly_limit) : undefined,
      limitsByPeriod: c.limits_by_period || undefined,
      distributionType: c.distribution_type || undefined,
    })) as Category[];
  } catch (error) {
    console.error('Failed to get categories:', error);
    return [];
  }
}

export async function addCategory(category: Category): Promise<void> {
  try {
    const { error } = await supabase.from('categories').insert({
      id: category.id,
      name: category.name,
      icon: category.icon || '💰',
      color: category.color || '#000000',
      type: category.type,
      monthly_limit: category.monthlyLimit || null,
      limits_by_period: category.limitsByPeriod || null,
      distribution_type: category.distributionType || null,
    });

    if (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to add category:', error);
    throw error;
  }
}

export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<void> {
  try {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.monthlyLimit !== undefined) updateData.monthly_limit = updates.monthlyLimit;
    if (updates.limitsByPeriod !== undefined) updateData.limits_by_period = updates.limitsByPeriod;
    if (updates.distributionType !== undefined) updateData.distribution_type = updates.distributionType;

    const { error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to update category:', error);
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw error;
  }
}

// Plans CRUD
export async function getPlan(
  month: number,
  year: number
): Promise<Plan | null> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - це нормально
        return null;
      }
      console.error('Error fetching plan:', error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      month: data.month,
      year: data.year,
      incomes: data.incomes || [],
      fixedExpenses: data.fixed_expenses || [],
      categoryLimits: data.category_limits || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as Plan;
  } catch (error) {
    console.error('Failed to get plan:', error);
    return null;
  }
}

export async function savePlan(plan: Plan): Promise<void> {
  try {
    const { error } = await supabase.from('plans').upsert({
      id: plan.id,
      month: plan.month,
      year: plan.year,
      incomes: plan.incomes,
      fixed_expenses: plan.fixedExpenses,
      category_limits: plan.categoryLimits,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    });

    if (error) {
      console.error('Error saving plan:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to save plan:', error);
    throw error;
  }
}

export async function deletePlan(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete plan:', error);
    throw error;
  }
}

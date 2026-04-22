import { supabase } from "./supabase";

export const DEFAULT_PLANNER_STATE = {
  budgetTarget: 4500,
  transactions: [],
  customCategories: [],
  categoryBudgets: {},
};

function normalizePlannerState(record) {
  return {
    budgetTarget: Number(record?.budget_target) || DEFAULT_PLANNER_STATE.budgetTarget,
    transactions: Array.isArray(record?.transactions) ? record.transactions : DEFAULT_PLANNER_STATE.transactions,
    customCategories: Array.isArray(record?.custom_categories) ? record.custom_categories : DEFAULT_PLANNER_STATE.customCategories,
    categoryBudgets:
      record?.category_budgets && typeof record.category_budgets === "object"
        ? record.category_budgets
        : DEFAULT_PLANNER_STATE.categoryBudgets,
  };
}

export async function loadPlannerState(user) {
  const { data, error } = await supabase
    .from("planner_profiles")
    .select("budget_target, transactions, custom_categories, category_budgets")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return normalizePlannerState(data);
  }

  const payload = {
    user_id: user.id,
    email: user.email,
    budget_target: DEFAULT_PLANNER_STATE.budgetTarget,
    transactions: DEFAULT_PLANNER_STATE.transactions,
    custom_categories: DEFAULT_PLANNER_STATE.customCategories,
    category_budgets: DEFAULT_PLANNER_STATE.categoryBudgets,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("planner_profiles")
    .insert(payload)
    .select("budget_target, transactions, custom_categories, category_budgets")
    .single();

  if (insertError) {
    throw insertError;
  }

  return normalizePlannerState(inserted);
}

export async function savePlannerState(user, plannerState) {
  const { error } = await supabase.from("planner_profiles").upsert(
    {
      user_id: user.id,
      email: user.email,
      budget_target: plannerState.budgetTarget,
      transactions: plannerState.transactions,
      custom_categories: plannerState.customCategories,
      category_budgets: plannerState.categoryBudgets,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw error;
  }
}

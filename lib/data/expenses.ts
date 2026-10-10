/**
 * The expense queries. Components call these, never Dexie directly.
 */
import { database, newId, type Expense } from "@/lib/db";
import { isCategoryId } from "@/lib/data/categories";

const expenses = async () => (await database.ready()).expenses;

export type ExpenseInput = {
  /** Positive amount in the app's currency. */
  amount: number;
  /** A category id from `lib/data/categories.ts`. */
  category: string;
  /** ISO calendar date, `YYYY-MM-DD`. */
  date: string;
};

/**
 * Every expense dated in the given month, in date order.
 *
 * `monthKey` is `YYYY-MM`. The range bounds are lexical: every full ISO date of that month sorts
 * between `-00` and `-99`, whatever the month's length, so the date index does the filtering.
 */
export async function listExpensesInMonth(monthKey: string): Promise<Expense[]> {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return [];
  const rows = await (await expenses())
    .where("date")
    .between(`${monthKey}-00`, `${monthKey}-99`, true, true)
    .toArray();
  return rows.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt);
}

/** Save a new expense. The amount is rounded to two decimals so totals never carry float dust. */
export async function addExpense(input: ExpenseInput): Promise<Expense> {
  if (!(input.amount > 0) || !Number.isFinite(input.amount)) {
    throw new Error("The amount must be a positive number.");
  }
  if (!isCategoryId(input.category)) {
    throw new Error("The expense needs a category.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new Error("The expense needs a date.");
  }
  const expense: Expense = {
    id: newId(),
    amount: Math.round(input.amount * 100) / 100,
    category: input.category,
    date: input.date,
    createdAt: Date.now(),
  };
  await (await expenses()).add(expense);
  return expense;
}

/** Remove an expense for good. Use `restoreExpense` to put one back. */
export async function deleteExpense(id: string): Promise<void> {
  await (await expenses()).delete(id);
}

/**
 * Put a previously deleted expense back, unchanged — same id, amount, category and date. Used by
 * the Undo action on the delete toast.
 */
export async function restoreExpense(expense: Expense): Promise<void> {
  await (await expenses()).put(expense);
}

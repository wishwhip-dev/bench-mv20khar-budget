"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { AddExpenseForm } from "@/components/add-expense-form";
import { CategoryChart, type CategoryDatum } from "@/components/category-chart";
import { DataCard } from "@/components/data-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { database, type Expense } from "@/lib/db";
import { CATEGORIES, categoryLabel } from "@/lib/data/categories";
import {
  addExpense,
  deleteExpense,
  listExpensesInMonth,
  restoreExpense,
  type ExpenseInput,
} from "@/lib/data/expenses";
import {
  dayLabel,
  formatCurrency,
  monthKeyOf,
  monthLabel,
  shiftMonth,
  todayIso,
} from "@/lib/data/months";
import { useIsHydrated, useStorageStatus, useStoredQuery } from "@/lib/storage/react";

/** The same five colours the chart config maps, by category id. */
const CATEGORY_COLOR: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category, index) => [category.id, `var(--chart-${index + 1})`]),
);

export function SpendTracker() {
  const hydrated = useIsHydrated();
  const status = useStorageStatus(database);
  // `null` until hydration: the month is only known in the browser, and the server must render
  // the same placeholder the first client render does.
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const monthKey = selectedMonth ?? (hydrated ? monthKeyOf(todayIso()) : null);

  const { data: monthExpenses, isLoading } = useStoredQuery(
    database,
    () => (monthKey ? listExpensesInMonth(monthKey) : Promise.resolve([] as Expense[])),
    [monthKey],
  );

  // A stable `[]` while loading, so memos below do not see a new array every render.
  const expenses = useMemo(() => monthExpenses ?? [], [monthExpenses]);

  const total = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);

  /** All five categories, highest spend first, zeros included — the chart's bars in numbers. */
  const breakdown = useMemo(() => {
    const totals = new Map<string, number>(CATEGORIES.map((category) => [category.id, 0]));
    for (const expense of expenses) {
      totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
    }
    const rows = CATEGORIES.map((category) => ({
      categoryId: category.id,
      label: category.label,
      amount: totals.get(category.id) ?? 0,
    }));
    return rows.sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  async function handleAdd(input: ExpenseInput) {
    try {
      const expense = await addExpense(input);
      toast.success(`Added ${formatCurrency(expense.amount)} for ${categoryLabel(expense.category)}`, {
        description: `Dated ${dayLabel(expense.date)}.`,
      });
      // An expense dated in another month belongs to that month's view, so go to it.
      setSelectedMonth(monthKeyOf(expense.date));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not add the expense. Please try again.",
      );
    }
  }

  async function handleDelete(expense: Expense) {
    try {
      await deleteExpense(expense.id);
    } catch {
      toast.error("Could not delete the expense. Please try again.");
      return;
    }
    toast(`Deleted ${formatCurrency(expense.amount)} for ${categoryLabel(expense.category)}`, {
      description: `Dated ${dayLabel(expense.date)}.`,
      action: {
        label: "Undo",
        onClick: () => {
          restoreExpense(expense).catch(() => {
            toast.error("Could not undo the delete. Please add the expense again.");
          });
        },
      },
      duration: 10_000,
    });
  }

  if (!hydrated) {
    return (
      <div className="grid grid-cols-1 gap-6" aria-busy="true">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <p className="text-center text-sm text-muted-foreground">Loading your expenses…</p>
      </div>
    );
  }

  const maxCategory = breakdown[0]?.amount ?? 0;

  return (
    <div className="grid grid-cols-1 gap-6">
      {status === "memory" && (
        <Alert>
          <AlertTitle>This browser will not keep your data</AlertTitle>
          <AlertDescription>
            Everything you add lasts only until this tab closes. Export a copy below to keep it.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous month"
            onClick={() => setSelectedMonth(shiftMonth(monthKey!, -1))}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <h2 className="text-center text-lg font-semibold tracking-tight">
            {monthLabel(monthKey!)}
          </h2>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next month"
            onClick={() => setSelectedMonth(shiftMonth(monthKey!, 1))}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <Card>
          <CardContent className="grid gap-1 py-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Total for {monthLabel(monthKey!)}
            </p>
            <p
              className="text-4xl font-bold tracking-tight tabular-nums sm:text-5xl"
              aria-live="polite"
            >
              {formatCurrency(total)}
            </p>
            <p className="text-sm text-muted-foreground">
              {expenses.length} {expenses.length === 1 ? "expense" : "expenses"} this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add an expense</CardTitle>
          <CardDescription>Amount, category and date — it lands in that month.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddExpenseForm onAdd={handleAdd} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By category</CardTitle>
          <CardDescription>Every category for {monthLabel(monthKey!)}, highest first.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <CategoryChart data={breakdown satisfies CategoryDatum[]} />
          <ul className="grid gap-2.5">
            {breakdown.map((row) => (
              <li key={row.categoryId} className="grid gap-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{row.label}</span>
                  <span className="tabular-nums">{formatCurrency(row.amount)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: maxCategory > 0 ? `${(row.amount / maxCategory) * 100}%` : "0%",
                      backgroundColor: CATEGORY_COLOR[row.categoryId],
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expenses</CardTitle>
          <CardDescription>In date order, earliest first.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-3" aria-busy="true">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : expenses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No expenses in this month.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {expenses.map((expense) => (
                <li key={expense.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {categoryLabel(expense.category)}
                    </p>
                    <p className="text-xs text-muted-foreground">{dayLabel(expense.date)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatCurrency(expense.amount)}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => void handleDelete(expense)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <DataCard database={database} />
    </div>
  );
}
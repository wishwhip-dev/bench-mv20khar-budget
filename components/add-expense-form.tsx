"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/data/categories";
import { todayIso, type ExpenseInput } from "@/lib/data/expenses-months";

/** The largest amount the tracker accepts; anything above it is a typo, not a purchase. */
const MAX_AMOUNT = 9_999_999;

function validateAmount(raw: string): string | undefined {
  const text = raw.trim();
  if (!text) return "Enter an amount.";
  const value = Number(text);
  if (!Number.isFinite(value)) return "Enter a number, like 12.50.";
  if (value <= 0) return "The amount must be more than zero.";
  if (value > MAX_AMOUNT) return "The amount cannot be more than 9,999,999.";
  return undefined;
}

type FieldErrors = { amount?: string; category?: string; date?: string };

export function AddExpenseForm({ onAdd }: { onAdd: (input: ExpenseInput) => Promise<void> }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(todayIso());
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const clearError = (field: keyof FieldErrors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {
      amount: validateAmount(amount),
      category: category ? undefined : "Choose a category.",
      date: date ? undefined : "Choose a date.",
    };
    setErrors(nextErrors);
    if (nextErrors.amount || nextErrors.category || nextErrors.date) return;

    setSubmitting(true);
    try {
      await onAdd({ amount: Number(amount.trim()), category, date });
      setAmount("");
      setCategory("");
      setDate(todayIso());
      setErrors({});
    } finally {
      setSubmitting(false);
    }
  }

  const errorText = (field: keyof FieldErrors, id: string) =>
    errors[field] ? (
      <p id={id} role="alert" className="text-sm font-medium text-destructive">
        {errors[field]}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr]">
      <div className="grid gap-1.5">
        <Label htmlFor="expense-amount">Amount</Label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
          >
            $
          </span>
          <Input
            id="expense-amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="pl-8"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              clearError("amount");
            }}
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? "expense-amount-error" : undefined}
          />
        </div>
        {errorText("amount", "expense-amount-error")}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="expense-category">Category</Label>
        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value);
            clearError("category");
          }}
        >
          <SelectTrigger
            id="expense-category"
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? "expense-category-error" : undefined}
          >
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errorText("category", "expense-category-error")}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="expense-date">Date</Label>
        <Input
          id="expense-date"
          type="date"
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            clearError("date");
          }}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? "expense-date-error" : undefined}
        />
        {errorText("date", "expense-date-error")}
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:col-span-3">
        {submitting ? "Adding…" : "Add expense"}
      </Button>
    </form>
  );
}
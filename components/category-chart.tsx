"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CATEGORIES } from "@/lib/data/categories";
import { formatCurrency } from "@/lib/data/months";

export type CategoryDatum = { categoryId: string; label: string; amount: number };

// One colour per category, taken from the themed palette; the config turns each key into a
// --color-<key> variable that the bars below reference.
const chartConfig = {
  amount: { label: "Spent" },
  ...Object.fromEntries(
    CATEGORIES.map((category, index) => [
      category.id,
      { label: category.label, color: `var(--chart-${index + 1})` },
    ]),
  ),
} satisfies ChartConfig;

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

/**
 * The selected month's spending, one bar per category — all five are passed in and drawn even
 * when an amount is zero, so the bars line up with the breakdown list beside them.
 */
export function CategoryChart({ data }: { data: CategoryDatum[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full sm:h-64">
      <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          interval={0}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tick={{ fontSize: 10 }}
          tickFormatter={(value: number) => compactCurrency.format(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />
          }
        />
        <Bar dataKey="amount" isAnimationActive={false} radius={4}>
          {data.map((datum) => (
            <Cell key={datum.categoryId} fill={`var(--color-${datum.categoryId})`} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
/**
 * This application's database.
 *
 * The reusable half of the setup is in `lib/storage/` and is not edited. This file is the half
 * that describes the product: which tables exist, what is indexed, how the schema has changed over
 * time. This is the first release, so version 1 is the spending tracker's own schema.
 */
import { defineDatabase } from "@/lib/storage/database";

/** One expense the person recorded. */
export type Expense = {
  id: string;
  /** ISO calendar date, `YYYY-MM-DD`, in the person's local calendar. Indexed: queried by month. */
  date: string;
  /** Positive amount in the app's currency, rounded to two decimals. */
  amount: number;
  /** One of the ids in `lib/data/categories.ts`. */
  category: string;
  /** Epoch millis, only used to order expenses added on the same day. */
  createdAt: number;
};

/** Ids are generated here so the data layer never depends on an auto-increment round trip. */
export function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const database = defineDatabase<{ expenses: Expense }>({
  // Part of the origin's storage identity. Renaming it does not migrate anything — it points the
  // application at a different, empty database and abandons the old one in place. That is exactly
  // what you want on a first build, and never what you want afterwards.
  name: "monthly-spending",
  versions: [
    // Only the primary key and the properties queried on. `amount` and `category` are stored but
    // never filtered or sorted by, so indexing them would cost writes and buy nothing.
    { version: 1, stores: { expenses: "id, date" } },
  ],
  // No seed: a spending tracker starts empty, and the page says so plainly rather than filling
  // itself with invented expenses.
});

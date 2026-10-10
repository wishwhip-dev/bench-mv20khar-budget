/**
 * Calendar and money formatting, over the person's local calendar dates. Everything here takes or
 * returns fixed, explicit values (ISO strings, `en-US`/USD) so the server and the first client
 * render always agree — no `Date.now()`, no `toLocaleString`, no reading the visitor's locale.
 */

export const CURRENCY = "USD";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
});

/** `12.5` → `$12.50` — always two decimal places and a currency symbol. */
export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** Today's ISO calendar date, built from the local calendar — never UTC, so midnight and
 * daylight-saving changes cannot move it a day. Only call from the browser, after hydration. */
export function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** The `YYYY-MM` key of an ISO date, or of today when no date is given. */
export function monthKeyOf(dateIso: string): string {
  return dateIso.slice(0, 7);
}

/** `YYYY-MM` moved by `delta` months — forward or back, across year boundaries. */
export function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  // Day 1, built from local parts: safe across daylight-saving changes.
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** `2025-10` → `October 2025`. */
export function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

/** `2025-10-12` → `12 Oct`. */
export function dayLabel(dateIso: string): string {
  const [year, month, day] = dateIso.split("-").map(Number);
  if (!year || !month || !day) return dateIso;
  return `${day} ${MONTHS_SHORT[month - 1]}`;
}

/**
 * The spending categories. Every part of the app — the select, the expense list, the breakdown and
 * the chart — reads its category ids and display labels from here, so a category is never
 * hard-coded somewhere else.
 */
export type CategoryId = "food" | "transport" | "home" | "fun" | "other";

export type Category = {
  id: CategoryId;
  /** The display label shown everywhere in the app. */
  label: string;
};

export const CATEGORIES: readonly Category[] = [
  { id: "food", label: "Food" },
  { id: "transport", label: "Transport" },
  { id: "home", label: "Home" },
  { id: "fun", label: "Fun" },
  { id: "other", label: "Other" },
];

const LABELS: Record<CategoryId, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.label]),
) as Record<CategoryId, string>;

/** The display label for a category id, falling back to the raw id for anything unknown. */
export function categoryLabel(id: string): string {
  return LABELS[id as CategoryId] ?? id;
}

/** A guard for input that claims to be a category id. */
export function isCategoryId(id: string): id is CategoryId {
  return Object.hasOwn(LABELS, id);
}

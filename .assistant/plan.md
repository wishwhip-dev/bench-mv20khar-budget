# Plan

Goal: A monthly spending tracker. I add an expense with an amount, a category (food, transport, home, fun or other) and a date, and see this month's total and a chart of spending by category. I can switch to earlier months and delete an expense I got wrong. Everything survives a reload and is comfortable on a phone.

1. The home page shows an 'Add expense' form with a labelled amount input that accepts decimal values like 12.50, a category select offering exactly Food, Transport, Home, Fun and Other, a date input defaulting to today, and an 'Add expense' submit button; submitting with an amount and category adds the expense to a visible list on the same page and shows a confirmation toast
2. Submitting the form with an empty, zero, negative or absurdly large (over 9,999,999) amount shows an inline error message next to the amount field and does not add an expense; submitting with no category selected shows an inline error next to the category and does not add an expense
3. The five categories and their display labels live in a data module under lib/data, and the select, list, breakdown and chart all read from it rather than hard-coding them
4. Above the list, a prominent readout shows the currently selected month's total spend and the number of expenses, with amounts formatted to two decimal places with a currency symbol, and it updates immediately when an expense is added or deleted
5. Under the readout, a breakdown lists all five categories with that month's total per category — including categories with zero spend — ordered from highest to lowest, so each chart bar has a matching number
6. A chart built with components/ui/chart (Recharts) plots the selected month's spending by category — one bar per category, with all five present even when the amount is zero — and updates immediately when expenses are added or deleted
7. Month navigation controls (previous and next arrows) with a month/year heading let the user switch to earlier and later months, including future months, and the total, breakdown, chart and expense list all switch to show only that month's data
8. The expense list for the selected month shows each entry as a row with its amount, category label and date, in date order, and each row has a 'Delete' button that removes that expense and immediately updates the total, breakdown and chart
9. Adding an expense whose date falls in a month other than the one currently viewed saves it under its own date's month: the page switches to that month and the new expense appears in its list, total and chart
10. When the selected month has no expenses, the page shows a message such as 'No expenses in this month' while the add form and month navigation remain usable
11. After deleting an expense, a toast offers 'Undo'; pressing Undo restores the deleted expense with its original amount, category and date, and the totals reflect it again
12. Expenses are saved to the Dexie database through lib/data queries (not localStorage), and after reloading the page all previously added expenses are still present with their amounts, categories and dates, and the current month's total, breakdown and chart are rebuilt from them
13. The layout is comfortable at a 360px-wide phone screen: the form, readout, breakdown, chart and list stack vertically, all controls are at least 32px tall, and the chart scales to the viewport width without horizontal scrolling
14. The page title, name and description in app/identity.ts are updated to describe the spending tracker

These are the outcomes this task is judged against.
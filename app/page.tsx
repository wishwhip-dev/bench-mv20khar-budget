import { SpendTracker } from "@/components/spend-tracker";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Monthly spending</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track what you spend, one month at a time. Everything stays in this browser.
        </p>
      </header>
      <SpendTracker />
    </main>
  );
}
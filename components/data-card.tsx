"use client";

import { FileDrop } from "@/components/file-drop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDatabaseTransfer } from "@/lib/storage/react";
import type { DatabaseHandle, TableMap } from "@/lib/storage/database";
import type { Expense } from "@/lib/db";

/**
 * Moving the tracker's data in and out of this browser. The export is a JSON file of every
 * expense; an import is applied in one transaction and reported here. Kept reachable because
 * preview and the published site are different origins, and a browser can clear this data.
 */
export function DataCard({ database }: { database: DatabaseHandle<{ expenses: Expense } & TableMap> }) {
  const { state, exportToFile, importFromFile } = useDatabaseTransfer(database);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your data</CardTitle>
        <CardDescription>
          Everything lives in this browser. Export a copy to carry it to another device or keep a
          backup.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button type="button" variant="outline" onClick={() => void exportToFile()}>
          Export data
        </Button>
        <FileDrop
          accept="application/json,.json"
          label="Import data"
          onFiles={async ([file]) => {
            if (!file) return;
            await importFromFile(file, "merge");
          }}
        />
        {state.kind === "working" && <p className="text-sm text-muted-foreground">Working…</p>}
        {state.kind === "imported" && (
          <p className="text-sm text-muted-foreground" role="status">
            Imported {state.result.added} expense{state.result.added === 1 ? "" : "s"}.
          </p>
        )}
        {state.kind === "error" && (
          <p className="text-sm font-medium text-destructive" role="alert">
            {state.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
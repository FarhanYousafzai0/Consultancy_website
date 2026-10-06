"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PROGRAM_IMPORT_TEMPLATE } from "@/lib/admin/program-import";

export function ProgramImportForm() {
  const router = useRouter();
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [payload, setPayload] = useState(PROGRAM_IMPORT_TEMPLATE);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/programs/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, payload }),
      });
      const data = (await res.json()) as {
        error?: string;
        details?: string[];
        inserted?: number;
        skipped?: number;
        parseErrors?: string[];
      };
      if (!res.ok) {
        throw new Error(
          [data.error, ...(data.details ?? [])].filter(Boolean).join(" ")
        );
      }
      setMessage(
        `Imported ${data.inserted ?? 0} draft program(s). Skipped ${data.skipped ?? 0} duplicate(s).${
          data.parseErrors?.length
            ? ` Parse warnings: ${data.parseErrors.length}.`
            : ""
        }`
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={format === "json" ? "default" : "outline"}
          onClick={() => setFormat("json")}
        >
          JSON
        </Button>
        <Button
          type="button"
          size="sm"
          variant={format === "csv" ? "default" : "outline"}
          onClick={() => {
            setFormat("csv");
            setPayload(
              "name,university,city,sourceUrl\nM.Sc. Example,Example University,Berlin,https://example.com/program"
            );
          }}
        >
          CSV
        </Button>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">
          Paste {format.toUpperCase()} (imports as draft — verify before publish)
        </span>
        <textarea
          className="min-h-[280px] w-full rounded-2xl border border-input bg-background p-3 font-mono text-xs"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
        />
      </label>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-forest" role="status">
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={busy}>
        {busy ? "Importing…" : "Import as drafts"}
      </Button>
    </form>
  );
}

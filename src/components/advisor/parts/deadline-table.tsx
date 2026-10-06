"use client";

type DeadlineItem = {
  name?: string;
  type?: string;
  semester?: string;
  year?: number;
  deadlineNonEu?: string | null;
  openAt?: string | null;
  closeAt?: string | null;
  status?: string;
  note?: string;
};

export function DeadlineTable({ items }: { items: DeadlineItem[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-2 overflow-x-auto rounded-xl bg-background">
      <table className="w-full text-left text-xs">
        <thead className="text-muted-foreground">
          <tr>
            <th className="px-2 py-1.5 font-semibold">Item</th>
            <th className="px-2 py-1.5 font-semibold">Deadline</th>
            <th className="px-2 py-1.5 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, i) => (
            <tr key={`${row.name}-${i}`} className="border-t border-border/60">
              <td className="px-2 py-1.5">
                {row.name ?? row.type ?? "—"}
                {row.semester ? ` (${row.semester} ${row.year ?? ""})` : null}
                {row.note ? ` — ${row.note}` : null}
              </td>
              <td className="px-2 py-1.5">
                {row.deadlineNonEu ??
                  row.closeAt ??
                  (row.openAt ? `opens ${row.openAt}` : "—")}
              </td>
              <td className="px-2 py-1.5">{row.status ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

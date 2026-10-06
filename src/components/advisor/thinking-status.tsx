"use client";

const TOOL_LABELS: Record<string, string> = {
  search_programs: "Searching programs",
  check_eligibility: "Checking eligibility",
  get_deadlines: "Looking up deadlines",
  list_scholarships: "Searching scholarships",
  get_document_checklist: "Loading documents",
  search_guides: "Searching guides",
};

export function ThinkingDots({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-hidden>
      <span className="parwaz-dot size-1.5 rounded-full bg-forest" />
      <span className="parwaz-dot size-1.5 rounded-full bg-forest" />
      <span className="parwaz-dot size-1.5 rounded-full bg-forest" />
    </span>
  );
}

export function ThinkingStatus({ label }: { label: string }) {
  return (
    <div
      className="mr-8 inline-flex items-center gap-2.5 rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <ThinkingDots />
      <span className="font-medium text-ink/80">{label}</span>
    </div>
  );
}

export function StreamingCaret() {
  return (
    <span
      className="parwaz-caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-0.5 bg-forest align-text-bottom"
      aria-hidden
    />
  );
}

export function toolStatusLabel(toolName: string): string {
  return TOOL_LABELS[toolName] ?? `Running ${toolName.replaceAll("_", " ")}`;
}

export function liveAdvisorStatus(
  status: string,
  parts: Array<{ type: string; state?: string; text?: string }>
): string | null {
  const tool = parts.find(
    (p) =>
      p.type.startsWith("tool-") &&
      (p.state === "input-streaming" ||
        p.state === "input-available" ||
        p.state === "call")
  );
  if (tool) {
    return null;
  }
  if (status === "submitted") return "Thinking";
  const hasText = parts.some((p) => p.type === "text" && p.text?.trim());
  if (status === "streaming" && !hasText) return "Writing";
  return null;
}

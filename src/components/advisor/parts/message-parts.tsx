"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ProgramCards } from "./program-cards";
import { ScholarshipCards } from "./scholarship-cards";
import { DeadlineTable } from "./deadline-table";
import { Checklist } from "./checklist";
import { GuideSnippets } from "./guide-snippets";
import { ThinkingDots, toolStatusLabel } from "@/components/advisor/thinking-status";

type ToolOutput = {
  kind?: string;
  text?: string;
  items?: Array<Record<string, unknown>>;
  sources?: Array<{
    type: string;
    id: string;
    title: string;
    href: string;
    lastVerifiedAt?: string | null;
  }>;
};

function toolNameFromType(type: string): string {
  return type.startsWith("tool-") ? type.slice(5) : type;
}

export function ToolStatusChip({ toolName }: { toolName: string }) {
  return (
    <span className="mt-1 inline-flex items-center gap-2 rounded-full bg-primary/30 px-2.5 py-1 text-[11px] font-semibold text-ink">
      <ThinkingDots />
      {toolStatusLabel(toolName)}
    </span>
  );
}

export function ToolResultPart({
  type,
  state,
  output,
  onNavigate,
}: {
  type: string;
  state?: string;
  output?: unknown;
  onNavigate?: () => void;
}) {
  const toolName = toolNameFromType(type);
  if (state === "input-streaming" || state === "input-available" || state === "call") {
    return <ToolStatusChip toolName={toolName} />;
  }
  if (state === "output-error") {
    return (
      <p className="mt-1 text-xs text-red-600">Tool failed: {toolName}</p>
    );
  }

  const data = (output ?? {}) as ToolOutput;
  const items = data.items ?? [];

  return (
    <div className="mt-1">
      {data.kind === "programs" ? (
        <ProgramCards items={items as never} />
      ) : null}
      {data.kind === "scholarships" ? (
        <ScholarshipCards items={items as never} />
      ) : null}
      {data.kind === "deadlines" ? (
        <DeadlineTable items={items as never} />
      ) : null}
      {data.kind === "checklist" ? <Checklist items={items as never} /> : null}
      {data.kind === "guides" ? (
        <GuideSnippets items={items as never} />
      ) : null}
      {data.kind === "eligibility" && items.length ? (
        <ProgramCards
          items={items.map((m) => ({
            id: String(m.programId ?? ""),
            name: String(m.name ?? ""),
            university: String(m.university ?? ""),
            href: typeof m.href === "string" ? m.href : undefined,
            degreeLevel: typeof m.tier === "string" ? `tier: ${m.tier}` : undefined,
          }))}
        />
      ) : null}
      {data.sources && data.sources.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {data.sources.map((s) => (
            <Link
              key={`${s.type}-${s.id}`}
              href={s.href}
              className="rounded-full bg-background px-2 py-0.5 text-[11px] font-semibold text-forest hover:underline"
              onClick={onNavigate}
            >
              {s.title}
              {s.lastVerifiedAt ? ` · ${s.lastVerifiedAt}` : ""}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Very small markdown-ish renderer: bold, bullets, links. */
export function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (/^\s*[-*]\s+/.test(line)) {
          return (
            <p key={i} className="pl-3 before:mr-1 before:content-['•']">
              {formatInline(line.replace(/^\s*[-*]\s+/, ""))}
            </p>
          );
        }
        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i}>{formatInline(line)}</p>;
      })}
    </div>
  );
}

function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|https?:\/\/\S+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(
        <a
          key={key++}
          href={token}
          className="text-forest underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {token}
        </a>
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

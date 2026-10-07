"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Drawer } from "vaul";
import { ChatCircleDots, PaperPlaneTilt, X } from "@phosphor-icons/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { whatsappLink } from "@/lib/site";
import {
  selectAnswers,
  useEligibilityStore,
} from "@/lib/eligibility";
import {
  SimpleMarkdown,
  ToolResultPart,
} from "@/components/advisor/parts/message-parts";
import {
  liveAdvisorStatus,
  StreamingCaret,
  ThinkingStatus,
} from "@/components/advisor/thinking-status";

type QuotaInfo = {
  limit: number;
  used: number;
  remaining: number;
  credits: number;
  loggedIn: boolean;
};

export function AdvisorChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [quotaReady, setQuotaReady] = useState(false);
  const [handoffUrl, setHandoffUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const store = useEligibilityStore();
  const answers = selectAnswers(store);
  const answersRef = useRef(answers);
  const threadRef = useRef(threadId);
  answersRef.current = answers;
  threadRef.current = threadId;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/advisor/chat",
        body: () => ({
          answers: answersRef.current,
          threadId: threadRef.current,
        }),
        fetch: async (input, init) => {
          const res = await fetch(input, init);
          const tid = res.headers.get("X-Thread-Id");
          if (tid) setThreadId(tid);
          const remaining = res.headers.get("X-AI-Quota-Remaining");
          const limit = res.headers.get("X-AI-Quota-Limit");
          const used = res.headers.get("X-AI-Quota-Used");
          if (remaining != null && limit != null && used != null) {
            setQuota((q) => ({
              limit: Number(limit),
              used: Number(used),
              remaining: Number(remaining),
              credits: q?.credits ?? 0,
              loggedIn: q?.loggedIn ?? false,
            }));
          }
          return res;
        },
      }),
    []
  );

  const { messages, sendMessage, status, error, clearError } = useChat({
    transport,
  });

  const loading = status === "submitted" || status === "streaming";
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const statusLabel = liveAdvisorStatus(
    status,
    (lastAssistant?.parts ?? []) as Array<{
      type: string;
      state?: string;
      text?: string;
    }>
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, statusLabel]);

  useEffect(() => {
    document.body.dataset.advisorOpen = open ? "true" : "false";
    return () => {
      document.body.dataset.advisorOpen = "false";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    void fetch("/api/advisor/quota")
      .then((r) => r.json())
      .then((data) => {
        if (data?.quota) {
          setQuota({
            limit: data.quota.limit,
            used: data.quota.used,
            remaining: data.quota.remaining,
            credits: data.credits ?? 0,
            loggedIn: Boolean(data.loggedIn),
          });
        }
      })
      .catch(() => {})
      .finally(() => setQuotaReady(true));
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    if (quota && quota.remaining <= 0) {
      setLocalError(
        quota.loggedIn
          ? "Daily chat limit reached. Buy AI credits via WhatsApp or try again tomorrow."
          : "Free visitor limit reached. Sign up for more messages."
      );
      return;
    }
    setInput("");
    setLocalError(null);
    clearError();
    await sendMessage({ text });
  }

  async function requestHandoff() {
    const lastQ =
      [...messages]
        .reverse()
        .find((m) => m.role === "user")
        ?.parts?.filter(
          (p): p is { type: "text"; text: string } => p.type === "text"
        )
        .map((p) => p.text)
        .join("\n") ?? "";
    const transcript = messages
      .slice(-6)
      .map((m) => {
        const text = m.parts
          ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join(" ");
        return `${m.role}: ${text}`;
      })
      .join("\n")
      .slice(0, 1500);

    const res = await fetch("/api/advisor/handoff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lastQuestion: lastQ,
        transcriptSnippet: transcript,
        goal: answers.goal,
      }),
    });
    const data = await res.json();
    if (res.ok && data.whatsappUrl) {
      setHandoffUrl(data.whatsappUrl);
      window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
    } else if (data.error === "ausbildung_self_serve") {
      setLocalError(
        "Ausbildung help stays self-serve for now — use the eligibility check and guides."
      );
    } else {
      const fallback = whatsappLink(
        "Hi! I'd like help applying to Germany after chatting with the advisor."
      );
      setHandoffUrl(fallback);
      window.open(fallback, "_blank", "noopener,noreferrer");
    }
  }

  async function buyCredits() {
    const res = await fetch("/api/advisor/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pack: "standard" }),
    });
    const data = await res.json();
    if (res.ok && data.whatsappUrl) {
      window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
    } else {
      setLocalError(data.error || "Could not start credit purchase.");
    }
  }

  const displayError = localError || error?.message || null;
  const showHandoff =
    Boolean(displayError) ||
    messages.some((m) =>
      m.parts?.some(
        (p) =>
          p.type === "text" &&
          /don't have verified|consultant|whatsapp/i.test(p.text)
      )
    );

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      {!open ? (
        <Drawer.Trigger asChild>
          <button
            type="button"
            className="fixed right-4 bottom-24 z-40 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-primary shadow-card transition-transform hover:scale-105 md:right-6 md:bottom-6"
            aria-label="Ask Parwaaz advisor"
          >
            <span className="relative grid size-5 place-items-center">
              <span className="parwaz-pulse-ring absolute inset-0 rounded-full bg-primary" />
              <ChatCircleDots className="relative size-5" weight="fill" />
            </span>
            Ask Parwaaz
          </button>
        </Drawer.Trigger>
      ) : null}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/40" />
        <Drawer.Content className="fixed inset-0 z-[60] flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden rounded-none bg-background outline-none after:hidden md:inset-auto md:top-auto md:right-6 md:bottom-6 md:left-auto md:h-[min(720px,85vh)] md:max-h-[min(720px,85vh)] md:w-[420px] md:rounded-3xl md:shadow-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <Drawer.Title className="text-base font-extrabold">
                Parwaaz Advisor
              </Drawer.Title>
              <Drawer.Description className="text-xs text-muted-foreground">
                Answers from verified programs, scholarships & guides
              </Drawer.Description>
              {quota ? (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {quota.remaining} of {quota.limit} free messages left today
                  {quota.credits > 0 ? ` · ${quota.credits} credits` : ""}
                </p>
              ) : open && !quotaReady ? (
                <Skeleton className="mt-1 h-3 w-44" />
              ) : null}
            </div>
            <button
              type="button"
              className="rounded-full p-2 hover:bg-muted"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ask about APS, deadlines, program fit, or scholarships. I only use
                our verified data — if I don&apos;t know, I&apos;ll say so.
              </p>
            ) : null}
            {messages.map((m) => {
              const isLastAssistant =
                m.role === "assistant" && m.id === lastAssistant?.id;
              const showCaret = isLastAssistant && status === "streaming";
              return (
                <div
                  key={m.id}
                  className={
                    m.role === "user"
                      ? "ml-8 rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "mr-4 rounded-2xl bg-muted px-3 py-2 text-sm"
                  }
                >
                  {m.parts?.map((part, i) => {
                    if (part.type === "text") {
                      return m.role === "assistant" ? (
                        <span key={`${m.id}-${i}`}>
                          <SimpleMarkdown text={part.text} />
                          {showCaret && i === m.parts.length - 1 ? (
                            <StreamingCaret />
                          ) : null}
                        </span>
                      ) : (
                        <p key={`${m.id}-${i}`} className="whitespace-pre-wrap">
                          {part.text}
                        </p>
                      );
                    }
                    if (part.type.startsWith("tool-")) {
                      const toolPart = part as {
                        type: string;
                        state?: string;
                        output?: unknown;
                      };
                      return (
                        <ToolResultPart
                          key={`${m.id}-${i}`}
                          type={toolPart.type}
                          state={toolPart.state}
                          output={toolPart.output}
                          onNavigate={() => setOpen(false)}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              );
            })}
            {statusLabel ? <ThinkingStatus label={statusLabel} /> : null}
            {displayError ? (
              <p className="text-sm text-red-600">{displayError}</p>
            ) : null}
            {quota && quota.remaining <= 0 ? (
              <div className="rounded-2xl border border-border bg-white p-3">
                <p className="text-sm font-semibold">Quota reached</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {quota.loggedIn
                    ? "Buy an AI credit pack via WhatsApp, or wait until tomorrow."
                    : "Create a free account for more daily messages."}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {!quota.loggedIn ? (
                    <Button asChild size="sm">
                      <a href="/signup">Sign up</a>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void buyCredits()}
                    >
                      Buy credits
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
            {showHandoff ? (
              <div className="rounded-2xl border border-border bg-white p-3">
                <p className="text-sm font-semibold">Want a human consultant?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Free WhatsApp chat for basics. Paid consultation if you need
                  deeper help.
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-2"
                  onClick={() => void requestHandoff()}
                >
                  Ask a consultant
                </Button>
                {handoffUrl ? (
                  <a
                    href={handoffUrl}
                    className="mt-2 block text-xs text-forest underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open WhatsApp again
                  </a>
                ) : null}
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Ask about studying in Germany…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <PaperPlaneTilt weight="fill" />
            </Button>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

import { after, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { getSession } from "@/lib/auth/session";
import {
  getStudentProfile,
  profileToAnswers,
} from "@/lib/db/student-profile";
import { emptyAnswers, type EligibilityAnswers } from "@/lib/eligibility/types";
import {
  appendMessages,
  getOrCreateThread,
} from "@/lib/db/advisor-threads";
import {
  collectSourcesFromMessages,
  streamAdvisorChat,
} from "@/lib/advisor/chat";
import {
  BudgetExceededError,
  QuotaExceededError,
  consumeChatQuota,
  getQuotaSnapshot,
} from "@/lib/advisor/budget";
import { getCatalog } from "@/lib/advisor/catalog";
import {
  cannedReplyForIntent,
  classifyAdvisorIntent,
} from "@/lib/advisor/zone";

const VISITOR_COOKIE = "parwaz_visitor";

export const maxDuration = 60;

function withVisitorCookie(
  response: Response,
  session: Awaited<ReturnType<typeof getSession>>,
  visitorId: string | null
) {
  if (session || !visitorId) return response;
  const next = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  next.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return next;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      messages?: UIMessage[];
      message?: string;
      threadId?: string;
      answers?: Partial<EligibilityAnswers>;
    };

    const session = await getSession();
    const jar = await cookies();
    let visitorId = jar.get(VISITOR_COOKIE)?.value ?? null;
    if (!session && !visitorId) {
      visitorId = randomUUID();
    }

    const subjectKey = session?.userId ?? visitorId ?? "anon";

    let messages = body.messages ?? [];
    if ((!messages || messages.length === 0) && body.message?.trim()) {
      messages = [
        {
          id: randomUUID(),
          role: "user",
          parts: [{ type: "text", text: body.message.trim() }],
        },
      ];
    }
    if (!messages.length) {
      return NextResponse.json(
        { error: "Message required." },
        { status: 400 }
      );
    }

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const lastText =
      lastUser?.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("\n")
        .trim() ?? "";

    if (!lastText || lastText.length > 4000) {
      return NextResponse.json(
        { error: "Message required (max 4000 chars)." },
        { status: 400 }
      );
    }

    const intent = classifyAdvisorIntent(lastText);

    // Greeting / off-topic: no quota burn, no LLM, no catalog load.
    if (intent === "greeting" || intent === "off_topic") {
      const reply = cannedReplyForIntent(intent);
      const profile = session
        ? await getStudentProfile(session.userId)
        : null;
      const hasCredits = Boolean(profile && profile.aiCredits > 0);
      const quota = await getQuotaSnapshot({
        subjectKey,
        isLoggedIn: Boolean(session),
        hasCredits,
      });
      const thread = await getOrCreateThread({
        userId: session?.userId ?? null,
        visitorId: session ? null : visitorId,
        threadId: body.threadId ?? null,
      });

      const stream = createUIMessageStream({
        originalMessages: messages,
        execute({ writer }) {
          const id = randomUUID();
          writer.write({ type: "text-start", id });
          writer.write({ type: "text-delta", id, delta: reply });
          writer.write({ type: "text-end", id });
        },
        onFinish: () => {
          after(async () => {
            try {
              await appendMessages(thread.id, [
                { role: "user", content: lastText },
                { role: "assistant", content: reply, sources: [] },
              ]);
            } catch (err) {
              console.error("[advisor/chat] persist zone", err);
            }
          });
        },
      });

      const response = createUIMessageStreamResponse({
        stream,
        headers: {
          "X-Thread-Id": thread.id,
          "X-AI-Quota-Limit": String(quota.limit),
          "X-AI-Quota-Used": String(quota.used),
          "X-AI-Quota-Remaining": String(quota.remaining),
          "X-AI-Zone": intent,
        },
      });
      return withVisitorCookie(response, session, visitorId);
    }

    const [profile] = await Promise.all([
      session ? getStudentProfile(session.userId) : Promise.resolve(null),
      getCatalog(),
    ]);

    const hasCredits = Boolean(profile && profile.aiCredits > 0);
    const quota = await consumeChatQuota({
      subjectKey,
      isLoggedIn: Boolean(session),
      hasCredits,
    });

    let answers = emptyAnswers();
    if (profile) answers = profileToAnswers(profile);
    if (body.answers) answers = { ...answers, ...body.answers };

    const thread = await getOrCreateThread({
      userId: session?.userId ?? null,
      visitorId: session ? null : visitorId,
      threadId: body.threadId ?? null,
    });

    const result = await streamAdvisorChat({
      messages,
      answers,
    });

    const stream = toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      onFinish: ({ messages: finished }) => {
        after(async () => {
          try {
            const assistant = [...finished]
              .reverse()
              .find((m) => m.role === "assistant");
            const replyText =
              assistant?.parts
                ?.filter(
                  (p): p is { type: "text"; text: string } => p.type === "text"
                )
                .map((p) => p.text)
                .join("\n")
                .trim() ?? "";
            const sources = collectSourcesFromMessages(finished);
            await appendMessages(thread.id, [
              { role: "user", content: lastText },
              {
                role: "assistant",
                content: replyText,
                sources,
              },
            ]);
          } catch (err) {
            console.error("[advisor/chat] persist", err);
          }
        });
      },
    });

    const response = createUIMessageStreamResponse({
      stream,
      headers: {
        "X-Thread-Id": thread.id,
        "X-AI-Quota-Limit": String(quota.limit),
        "X-AI-Quota-Used": String(quota.used),
        "X-AI-Quota-Remaining": String(quota.remaining),
        "X-AI-Zone": "in_zone",
      },
    });

    return withVisitorCookie(response, session, visitorId);
  } catch (error) {
    if (error instanceof BudgetExceededError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof QuotaExceededError) {
      return NextResponse.json(
        {
          error: error.message,
          quota: error.snapshot,
        },
        { status: 429 }
      );
    }
    console.error("[advisor/chat]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Advisor failed. Try again.",
      },
      { status: 500 }
    );
  }
}

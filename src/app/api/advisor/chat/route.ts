import { after, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import {
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
} from "@/lib/advisor/budget";
import { getCatalog } from "@/lib/advisor/catalog";

const VISITOR_COOKIE = "parwaz_visitor";

export const maxDuration = 60;

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
      },
    });

    if (!session && visitorId) {
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

    return response;
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

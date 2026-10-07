import { Resend } from "resend";
import {
  getAlertPreference,
  listUsersWithAlertsEnabled,
  markAlertSent,
} from "@/lib/db/alert-preferences";
import {
  CLOSED_APPLICATION_STATUSES,
  resolveDeadline,
} from "@/lib/applications/progress";
import { listShortlist } from "@/lib/db/shortlist";
import { listSavedScholarships } from "@/lib/db/saved-scholarships";
import { connectMongo } from "@/lib/db/connect";

const BUCKETS = [30, 14, 7] as const;

export type DeadlineAlertCandidate = {
  userId: string;
  email: string;
  kind: "program" | "scholarship";
  targetId: string;
  title: string;
  deadline: string;
  daysLeft: number;
  bucket: (typeof BUCKETS)[number];
  sendKey: string;
};

function daysUntil(dateStr: string, now = new Date()): number | null {
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const ms = d.getTime() - Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

function bucketFor(daysLeft: number): (typeof BUCKETS)[number] | null {
  for (const b of BUCKETS) {
    if (daysLeft === b) return b;
  }
  return null;
}

async function emailForUserId(userId: string): Promise<string | null> {
  await connectMongo();
  const { getNativeDb } = await import("@/lib/db/connect");
  const db = await getNativeDb();
  const user = (await db.collection("user").findOne({
    id: userId,
  })) as { email?: string } | null;
  if (user?.email) return user.email;

  // Some adapters store Better Auth id only in `id` field (string), not ObjectId.
  const alt = (await db.collection("user").findOne({
    $or: [{ id: userId }, { email: userId }],
  } as never)) as { email?: string } | null;
  return alt?.email ?? null;
}

export async function collectDeadlineAlerts(
  now = new Date()
): Promise<DeadlineAlertCandidate[]> {
  const prefs = await listUsersWithAlertsEnabled();
  const candidates: DeadlineAlertCandidate[] = [];

  for (const pref of prefs) {
    if (!pref.emailEnabled) continue;
    const email = await emailForUserId(pref.userId);
    if (!email) continue;

    const shortlist = await listShortlist(pref.userId);
    for (const item of shortlist) {
      if (CLOSED_APPLICATION_STATUSES.includes(item.status)) continue;
      const deadline = resolveDeadline(item);
      if (!deadline) continue;
      const daysLeft = daysUntil(deadline, now);
      if (daysLeft == null) continue;
      const bucket = bucketFor(daysLeft);
      if (!bucket) continue;
      const sendKey = `program:${item.programId}:${bucket}`;
      if (pref.lastSentAt[sendKey]) continue;
      candidates.push({
        userId: pref.userId,
        email,
        kind: "program",
        targetId: item.programId,
        title: item.program
          ? `${item.program.name} · ${item.program.university}`
          : "Shortlisted program",
        deadline,
        daysLeft,
        bucket,
        sendKey,
      });
    }

    const saved = await listSavedScholarships(pref.userId);
    for (const item of saved) {
      const deadlines =
        item.scholarship?.cycles
          ?.map((c) => c.closeAt)
          .filter((d): d is string => Boolean(d)) ?? [];
      for (const deadline of deadlines) {
        const daysLeft = daysUntil(deadline, now);
        if (daysLeft == null) continue;
        const bucket = bucketFor(daysLeft);
        if (!bucket) continue;
        const sendKey = `scholarship:${item.scholarshipId}:${bucket}`;
        if (pref.lastSentAt[sendKey]) continue;
        candidates.push({
          userId: pref.userId,
          email,
          kind: "scholarship",
          targetId: item.scholarshipId,
          title: item.scholarship
            ? `${item.scholarship.name} · ${item.scholarship.provider}`
            : "Saved scholarship",
          deadline,
          daysLeft,
          bucket,
          sendKey,
        });
      }
    }
  }

  return candidates;
}

export async function sendDeadlineAlerts(options?: {
  dryRun?: boolean;
  now?: Date;
}) {
  const dryRun = Boolean(options?.dryRun);
  const candidates = await collectDeadlineAlerts(options?.now);
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Parwaaz <onboarding@resend.dev>";

  const results: {
    sendKey: string;
    email: string;
    ok: boolean;
    error?: string;
  }[] = [];

  if (!resendKey && !dryRun) {
    return {
      candidates: candidates.length,
      sent: 0,
      results: [
        {
          sendKey: "*",
          email: "*",
          ok: false,
          error: "RESEND_API_KEY not set",
        },
      ],
    };
  }

  const resend = resendKey ? new Resend(resendKey) : null;

  for (const c of candidates) {
    if (dryRun) {
      results.push({ sendKey: c.sendKey, email: c.email, ok: true });
      continue;
    }

    const base = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    const link =
      c.kind === "program"
        ? `${base}/programs/${c.targetId}`
        : `${base}/scholarships/${c.targetId}`;

    try {
      const result = await resend!.emails.send({
        from,
        to: c.email,
        subject: `Deadline in ${c.daysLeft} days: ${c.title}`,
        text: [
          `Reminder from Parwaaz Consultancy`,
          ``,
          `${c.title}`,
          `Deadline: ${c.deadline} (${c.daysLeft} days left)`,
          ``,
          `Open: ${link}`,
          `Manage alerts: ${base}/dashboard/alerts`,
        ].join("\n"),
      });
      if (result.error) {
        results.push({
          sendKey: c.sendKey,
          email: c.email,
          ok: false,
          error: result.error.message,
        });
        continue;
      }
      await markAlertSent(c.userId, c.sendKey);
      results.push({ sendKey: c.sendKey, email: c.email, ok: true });
    } catch (error) {
      results.push({
        sendKey: c.sendKey,
        email: c.email,
        ok: false,
        error: error instanceof Error ? error.message : "send failed",
      });
    }
  }

  return {
    candidates: candidates.length,
    sent: results.filter((r) => r.ok).length,
    results,
  };
}

export async function ensureUserAlertDefaults(userId: string) {
  await getAlertPreference(userId);
}

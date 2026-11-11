import { Resend } from "resend";
import { adminEmails } from "@/lib/auth/auth";
import type { ConsultationRecord } from "@/lib/db/consultations";
import { summaryLines } from "./summary";

/**
 * Emails the team about a new request, and sends the student a receipt.
 * Without RESEND_API_KEY it logs and returns — submission never fails on email.
 */
export async function notifyNewConsultation(record: ConsultationRecord) {
  const key = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Parwaaz <onboarding@resend.dev>";
  const team =
    process.env.CONSULTATION_NOTIFY_EMAIL?.split(",").map((e) => e.trim()).filter(Boolean) ??
    adminEmails();
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  if (!key) {
    console.info(`[consultation] ${record.reference} saved (no RESEND_API_KEY, emails skipped)`);
    return;
  }
  const resend = new Resend(key);
  const lines = summaryLines(record.answers);

  const jobs: Promise<unknown>[] = [];
  if (team.length) {
    jobs.push(
      resend.emails.send({
        from,
        to: team,
        replyTo: record.email,
        subject: `New consultation ${record.reference} · ${record.fullName}`,
        text: [
          `Reference: ${record.reference}`,
          ...lines,
          "",
          `Open: ${baseUrl}/admin/consultations/${record.id}`,
        ].join("\n"),
      })
    );
  }
  jobs.push(
    resend.emails.send({
      from,
      to: record.email,
      subject: `We received your consultation request (${record.reference})`,
      text: [
        `Hi ${record.fullName.split(" ")[0]},`,
        "",
        `Thanks for requesting a consultation with Parwaaz. Your reference is ${record.reference}.`,
        "A consultant will review your profile and contact you within 1 business day on your preferred channel.",
        "",
        "Parwaaz Consultancy",
      ].join("\n"),
    })
  );

  const results = await Promise.allSettled(jobs);
  for (const r of results) {
    if (r.status === "rejected") console.error("[consultation] email failed", r.reason);
  }
}

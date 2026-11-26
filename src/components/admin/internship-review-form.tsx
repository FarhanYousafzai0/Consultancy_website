"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InternshipInput, InternshipRecord } from "@/lib/db/types";

const fields = ["computer_science", "engineering", "data", "business", "economics", "natural_sciences", "health", "social_sciences", "arts", "other"] as const;

function list(value: string[]) { return value.join("\n"); }
function split(value: string) { return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean); }

export function InternshipReviewForm({ initial }: { initial: InternshipRecord }) {
  const router = useRouter();
  const starting = useMemo(() => ({
    title: initial.title, organizationName: initial.organizationName, organizationLogoUrl: initial.organizationLogoUrl ?? "",
    summary: initial.summary, description: initial.description, countryCode: initial.countryCode ?? "", city: initial.city ?? "",
    locationLabel: initial.locationLabel ?? "", workMode: initial.workMode, durationText: initial.durationText ?? "",
    startDate: initial.startDate?.slice(0, 10) ?? "", endDate: initial.endDate?.slice(0, 10) ?? "", deadline: initial.deadline?.slice(0, 10) ?? "",
    deadlineStatus: initial.deadlineStatus, eligibilityCriteria: list(initial.eligibilityCriteria), eligibleNationalities: list(initial.eligibleNationalities),
    studyFields: initial.studyFields, educationLevels: initial.educationLevels, experienceRequirements: initial.experienceRequirements ?? "",
    fundingStatus: initial.fundingStatus, stipendSummary: initial.stipendSummary ?? "", benefits: list(initial.benefits), applicationUrl: initial.applicationUrl ?? "", notes: initial.notes,
  } satisfies Record<string, unknown>), [initial]);
  const [form, setForm] = useState(starting);
  const [message, setMessage] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const patch = (key: string, value: unknown) => setForm((current) => ({ ...current, [key]: value }));

  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(null);
    const payload: Partial<InternshipInput> = {
      title: String(form.title), organizationName: String(form.organizationName), organizationLogoUrl: String(form.organizationLogoUrl) || null,
      summary: String(form.summary), description: String(form.description), countryCode: String(form.countryCode).toUpperCase() || null,
      city: String(form.city) || null, locationLabel: String(form.locationLabel) || null, workMode: form.workMode as InternshipInput["workMode"],
      durationText: String(form.durationText) || null, startDate: String(form.startDate) === (initial.startDate?.slice(0, 10) ?? "") ? initial.startDate : String(form.startDate) || null, endDate: String(form.endDate) === (initial.endDate?.slice(0, 10) ?? "") ? initial.endDate : String(form.endDate) || null,
      deadline: String(form.deadline) === (initial.deadline?.slice(0, 10) ?? "") ? initial.deadline : String(form.deadline) || null, deadlineStatus: form.deadlineStatus as InternshipInput["deadlineStatus"],
      eligibilityCriteria: split(String(form.eligibilityCriteria)), eligibleNationalities: split(String(form.eligibleNationalities)),
      studyFields: form.studyFields as InternshipInput["studyFields"], educationLevels: form.educationLevels as InternshipInput["educationLevels"],
      experienceRequirements: String(form.experienceRequirements) || null, fundingStatus: form.fundingStatus as InternshipInput["fundingStatus"],
      stipendSummary: String(form.stipendSummary) || null, benefits: split(String(form.benefits)), applicationUrl: String(form.applicationUrl) || null, notes: String(form.notes),
    };
    const response = await fetch(`/api/admin/internships/${initial.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (!response.ok) { const body = await response.json().catch(() => ({})); setMessage(body.error ?? "Could not save changes"); return; }
    setMessage("Changes saved. Material edits require a new review before publication."); router.refresh();
  }

  async function action(actionName: "verify" | "approve" | "reject" | "archive" | "expire" | "force-recheck") {
    setSaving(true); setMessage(null);
    const response = await fetch(`/api/admin/internships/${initial.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: actionName, note: reviewNote, confirmed }) });
    const body = await response.json().catch(() => ({})); setSaving(false);
    setMessage(response.ok ? `${actionName.replace("-", " ")} completed.` : (body.error ?? "Action failed"));
    if (response.ok) {
      if (actionName === "verify" && typeof body.internship?.notes === "string") {
        setForm((current) => ({ ...current, notes: body.internship.notes }));
        setReviewNote("");
        setConfirmed(false);
      }
      router.refresh();
    }
  }

  return <form onSubmit={save} className="space-y-6 rounded-2xl bg-white p-6 shadow-card">
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Title"><Input required value={String(form.title)} onChange={(e) => patch("title", e.target.value)} /></Field>
      <Field label="Organization"><Input required value={String(form.organizationName)} onChange={(e) => patch("organizationName", e.target.value)} /></Field>
      <Field label="Organization logo URL"><Input value={String(form.organizationLogoUrl)} onChange={(e) => patch("organizationLogoUrl", e.target.value)} /></Field>
      <Field label="Application URL"><Input type="url" value={String(form.applicationUrl)} onChange={(e) => patch("applicationUrl", e.target.value)} /></Field>
      <Field label="Country code"><Input value={String(form.countryCode)} onChange={(e) => patch("countryCode", e.target.value)} /></Field>
      <Field label="City"><Input value={String(form.city)} onChange={(e) => patch("city", e.target.value)} /></Field>
      <Field label="Location label"><Input value={String(form.locationLabel)} onChange={(e) => patch("locationLabel", e.target.value)} /></Field>
      <Field label="Work mode"><Select value={String(form.workMode)} onChange={(value) => patch("workMode", value)} options={[["remote", "Remote"], ["hybrid", "Hybrid"], ["on_site", "On-site"], ["unknown", "Unknown"]]} /></Field>
    </div>
    <Field label="Summary"><textarea required value={String(form.summary)} onChange={(e) => patch("summary", e.target.value)} className="min-h-20 w-full rounded-2xl border border-border px-3 py-2 text-sm" /></Field>
    <Field label="Description"><textarea required value={String(form.description)} onChange={(e) => patch("description", e.target.value)} className="min-h-32 w-full rounded-2xl border border-border px-3 py-2 text-sm" /></Field>
    <div className="grid gap-4 md:grid-cols-4">
      <Field label="Duration"><Input value={String(form.durationText)} onChange={(e) => patch("durationText", e.target.value)} /></Field>
      <Field label="Start date"><Input type="date" value={String(form.startDate)} onChange={(e) => patch("startDate", e.target.value)} /></Field>
      <Field label="End date"><Input type="date" value={String(form.endDate)} onChange={(e) => patch("endDate", e.target.value)} /></Field>
      <Field label="Deadline"><Input type="date" value={String(form.deadline)} onChange={(e) => patch("deadline", e.target.value)} /></Field>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      <Field label="Deadline status"><Select value={String(form.deadlineStatus)} onChange={(value) => patch("deadlineStatus", value)} options={[["confirmed", "Confirmed"], ["rolling", "Rolling"], ["not_published", "Not published"], ["ambiguous", "Ambiguous"]]} /></Field>
      <Field label="Funding status"><Select value={String(form.fundingStatus)} onChange={(value) => patch("fundingStatus", value)} options={[["paid", "Paid"], ["unpaid", "Unpaid"], ["fully_funded", "Fully funded"], ["partially_funded", "Partially funded"], ["unknown", "Unknown"]]} /></Field>
      <Field label="Stipend"><Input value={String(form.stipendSummary)} onChange={(e) => patch("stipendSummary", e.target.value)} /></Field>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Eligibility (one per line)"><textarea value={String(form.eligibilityCriteria)} onChange={(e) => patch("eligibilityCriteria", e.target.value)} className="min-h-28 w-full rounded-2xl border border-border px-3 py-2 text-sm" /></Field>
      <Field label="Benefits (one per line)"><textarea value={String(form.benefits)} onChange={(e) => patch("benefits", e.target.value)} className="min-h-28 w-full rounded-2xl border border-border px-3 py-2 text-sm" /></Field>
      <Field label="Eligible nationalities (one per line)"><textarea value={String(form.eligibleNationalities)} onChange={(e) => patch("eligibleNationalities", e.target.value)} className="min-h-24 w-full rounded-2xl border border-border px-3 py-2 text-sm" /></Field>
      <Field label="Experience requirements"><textarea value={String(form.experienceRequirements)} onChange={(e) => patch("experienceRequirements", e.target.value)} className="min-h-24 w-full rounded-2xl border border-border px-3 py-2 text-sm" /></Field>
    </div>
    <div><p className="mb-2 text-sm font-semibold">Study fields</p><div className="flex flex-wrap gap-2">{fields.map((field) => <button type="button" key={field} onClick={() => patch("studyFields", (form.studyFields as string[]).includes(field) ? (form.studyFields as string[]).filter((item) => item !== field) : [...(form.studyFields as string[]), field])} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${(form.studyFields as string[]).includes(field) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{field.replaceAll("_", " ")}</button>)}</div></div>
    <Field label="Internal notes"><textarea value={String(form.notes)} onChange={(e) => patch("notes", e.target.value)} className="min-h-24 w-full rounded-2xl border border-border px-3 py-2 text-sm" /></Field>
    <Field label="Human verification note"><textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Describe what you checked on the official page" className="min-h-24 w-full rounded-2xl border border-border px-3 py-2 text-sm" /></Field>
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /> I checked the saved listing, evidence, and application link against the official source.</label>
    <p className="text-sm text-muted-foreground">Save edits before verifying. Material edits require a new review and unpublish published records.</p>
    {message && <p className="text-sm text-muted-foreground" role="status">{message}</p>}
    <div className="flex flex-wrap gap-3"><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save edits"}</Button><Button type="button" variant="outline" disabled={saving || !confirmed || reviewNote.trim().length < 10 || JSON.stringify(form) !== JSON.stringify(starting)} onClick={() => action("verify")}>Mark verified</Button><Button type="button" variant="outline" disabled={saving || JSON.stringify(form) !== JSON.stringify(starting)} onClick={() => action("approve")}>Approve & publish</Button><Button type="button" variant="destructive" disabled={saving} onClick={() => action("reject")}>Reject</Button><Button type="button" variant="outline" disabled={saving} onClick={() => action("archive")}>Archive</Button><Button type="button" variant="outline" disabled={saving} onClick={() => action("expire")}>Expire</Button><Button type="button" variant="secondary" disabled={saving} onClick={() => action("force-recheck")}>Force re-check</Button></div>
  </form>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block space-y-1.5"><span className="text-sm font-semibold">{label}</span>{children}</label>; }
function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: readonly (readonly [string, string])[] }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm">{options.map(([option, label]) => <option key={option} value={option}>{label}</option>)}</select>; }

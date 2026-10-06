"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GuideInput, GuideRecord } from "@/lib/db/types";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const emptyForm = (): GuideInput => ({
  title: "",
  slug: "",
  topic: "faq",
  body: "",
  sourceUrl: "https://",
  lastVerifiedAt: new Date().toISOString().slice(0, 10),
  status: "draft",
});

export function GuideForm({ initial }: { initial?: GuideRecord }) {
  const router = useRouter();
  const starting = useMemo(() => {
    if (!initial) return emptyForm();
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = initial;
    void _id;
    void _c;
    void _u;
    return rest;
  }, [initial]);

  const [form, setForm] = useState<GuideInput>(starting);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial);

  function set<K extends keyof GuideInput>(key: K, value: GuideInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
      };
      const res = await fetch(
        isEdit ? `/api/admin/guides/${initial!.id}` : "/api/admin/guides",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push("/admin/guides");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-card">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Title</span>
        <Input
          value={form.title}
          onChange={(e) => {
            set("title", e.target.value);
            if (!isEdit) set("slug", slugify(e.target.value));
          }}
          required
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Slug</span>
        <Input
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          required
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Topic</span>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.topic}
          onChange={(e) => set("topic", e.target.value as GuideInput["topic"])}
        >
          {[
            "aps",
            "blocked_account",
            "visa",
            "uni_assist",
            "anabin",
            "studienkolleg",
            "faq",
            "other",
          ].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Body</span>
        <textarea
          className="min-h-48 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          required
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Source URL</span>
        <Input
          value={form.sourceUrl}
          onChange={(e) => set("sourceUrl", e.target.value)}
          required
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Last verified (YYYY-MM-DD)</span>
        <Input
          value={form.lastVerifiedAt ?? ""}
          onChange={(e) => set("lastVerifiedAt", e.target.value || null)}
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Status</span>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.status}
          onChange={(e) => set("status", e.target.value as GuideInput["status"])}
        >
          <option value="draft">draft</option>
          <option value="published">published</option>
        </select>
      </label>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : isEdit ? "Update guide" : "Create guide"}
      </Button>
    </form>
  );
}

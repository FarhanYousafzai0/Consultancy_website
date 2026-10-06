"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Review = {
  clarity: string;
  germanyFit: string;
  missingFacts: string[];
  rewriteSuggestions: string[];
  summary: string;
};

export function SopReviewForm({
  unlocked,
  credits = 0,
}: {
  unlocked: boolean;
  credits?: number;
}) {
  const [letter, setLetter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  async function requestPay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/advisor/sop-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letter, action: "request" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setWhatsappUrl(data.whatsappUrl);
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function runReview() {
    setLoading(true);
    setError(null);
    setReview(null);
    try {
      const res = await fetch("/api/advisor/sop-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letter, action: "review" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review failed");
      setReview(data.review);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Your motivation letter</span>
        <textarea
          className="min-h-56 w-full rounded-2xl border border-input bg-white px-4 py-3 text-sm shadow-card"
          placeholder="Paste your draft here (plain text)."
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
        />
      </label>
      <p className="text-xs text-muted-foreground">
        We critique structure and Germany-specific fit. We do not write a full
        letter for you to submit as your own work.
      </p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={loading || letter.trim().length < 80}
          onClick={() => void requestPay()}
        >
          Request review (WhatsApp)
        </Button>
        <Button
          type="button"
          disabled={loading || !unlocked || letter.trim().length < 80}
          onClick={() => void runReview()}
        >
          {unlocked ? "Run AI review" : "Locked until paid"}
        </Button>
      </div>
      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-forest underline"
        >
          Open WhatsApp again
        </a>
      ) : null}
      {!unlocked ? (
        <p className="rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
          After you message us, the founder marks your lead as paid in admin —
          then Run AI review unlocks. You can also spend AI credits ({credits}{" "}
          left).
        </p>
      ) : null}
      {review ? (
        <div className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
          <div>
            <h2 className="font-bold">Summary</h2>
            <p className="mt-1 text-sm text-foreground/85">{review.summary}</p>
          </div>
          <div>
            <h2 className="font-bold">Clarity</h2>
            <p className="mt-1 text-sm text-foreground/85">{review.clarity}</p>
          </div>
          <div>
            <h2 className="font-bold">Germany-specific fit</h2>
            <p className="mt-1 text-sm text-foreground/85">{review.germanyFit}</p>
          </div>
          {review.missingFacts.length > 0 ? (
            <div>
              <h2 className="font-bold">Missing facts</h2>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {review.missingFacts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {review.rewriteSuggestions.length > 0 ? (
            <div>
              <h2 className="font-bold">Rewrite suggestions</h2>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {review.rewriteSuggestions.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

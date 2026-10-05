"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function ShortlistToggle({
  programId,
  initiallySaved,
  signedIn,
}: {
  programId: string;
  initiallySaved: boolean;
  signedIn: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [loading, setLoading] = useState(false);

  if (!signedIn) {
    return (
      <Button asChild size="lg" variant="outline">
        <Link href={`/signup?next=/programs/${programId}`}>
          <BookmarkSimple />
          Save to shortlist
        </Link>
      </Button>
    );
  }

  async function toggle() {
    setLoading(true);
    if (saved) {
      const res = await fetch(
        `/api/me/shortlist?programId=${encodeURIComponent(programId)}`,
        { method: "DELETE" }
      );
      if (res.ok) setSaved(false);
    } else {
      const res = await fetch("/api/me/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }),
      });
      if (res.ok) setSaved(true);
    }
    setLoading(false);
  }

  return (
    <Button
      type="button"
      size="lg"
      variant={saved ? "secondary" : "outline"}
      disabled={loading}
      onClick={() => void toggle()}
    >
      <BookmarkSimple weight={saved ? "fill" : "regular"} />
      {saved ? "Saved" : "Save to shortlist"}
    </Button>
  );
}

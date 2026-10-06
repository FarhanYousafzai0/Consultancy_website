"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteGuideButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={async () => {
        if (!confirm("Delete this guide?")) return;
        const res = await fetch(`/api/admin/guides/${id}`, { method: "DELETE" });
        if (res.ok) router.refresh();
        else alert("Delete failed");
      }}
    >
      Delete
    </Button>
  );
}

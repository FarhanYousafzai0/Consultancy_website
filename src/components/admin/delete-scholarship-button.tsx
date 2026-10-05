"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteScholarshipButton({ id }: { id: string }) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm("Delete this scholarship?")) return;
    const res = await fetch(`/api/admin/scholarships/${id}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  }

  return (
    <Button type="button" size="sm" variant="destructive" onClick={onDelete}>
      Delete
    </Button>
  );
}

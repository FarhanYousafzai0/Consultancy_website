"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteProgramButton({ id }: { id: string }) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm("Delete this program?")) return;
    const res = await fetch(`/api/admin/programs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Could not delete program");
      return;
    }
    router.refresh();
  }

  return (
    <Button type="button" size="sm" variant="destructive" onClick={onDelete}>
      Delete
    </Button>
  );
}

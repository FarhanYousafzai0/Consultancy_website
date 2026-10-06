import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AUSBILDUNG_EVENT_TYPES,
  incrementAusbildungEvent,
} from "@/lib/ausbildung/demand";

const schema = z.object({
  event: z.enum(
    AUSBILDUNG_EVENT_TYPES as unknown as [
      (typeof AUSBILDUNG_EVENT_TYPES)[number],
      ...(typeof AUSBILDUNG_EVENT_TYPES)[number][],
    ]
  ),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  }
  try {
    const count = await incrementAusbildungEvent(parsed.data.event);
    return NextResponse.json({ ok: true, count });
  } catch (error) {
    console.error("[ausbildung/events]", error);
    return NextResponse.json({ error: "Could not record event." }, { status: 500 });
  }
}

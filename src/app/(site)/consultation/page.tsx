import { ConsultationForm, SuccessView } from "@/components/consultation/consultation-form";
import { getSession } from "@/lib/auth/session";

export const metadata = {
  title: "Request a consultation",
  description:
    "Book a consultation for your master's in Germany. Share your profile once — a Parwaaz consultant reviews it and contacts you within 1 business day.",
};

export default async function ConsultationPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; preview?: string }>;
}) {
  const [session, params] = await Promise.all([
    getSession().catch(() => null),
    searchParams,
  ]);

  if (process.env.NODE_ENV === "development" && params.preview === "success") {
    return <><p className="px-4 pt-6 text-center text-sm text-muted-foreground">Preview only — no evaluation has been submitted.</p><SuccessView reference="PZ-PREVIEW" name="Ahsan" channel="whatsapp" /></>;
  }

  return (
    <ConsultationForm
      initialName={session?.name && session.name !== session.email ? session.name : null}
      initialEmail={session?.email ?? null}
      initialService={params.service ?? null}
    />
  );
}

import { ConsultationForm } from "@/components/consultation/consultation-form";
import { getSession } from "@/lib/auth/session";

export const metadata = {
  title: "Request a consultation",
  description:
    "Book a consultation for your master's in Germany. Share your profile once — a Parwaaz consultant reviews it and contacts you within 1 business day.",
};

export default async function ConsultationPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const [session, params] = await Promise.all([
    getSession().catch(() => null),
    searchParams,
  ]);

  return (
    <ConsultationForm
      initialName={session?.name && session.name !== session.email ? session.name : null}
      initialEmail={session?.email ?? null}
      initialService={params.service ?? null}
    />
  );
}

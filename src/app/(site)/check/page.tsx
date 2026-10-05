import { CheckWizard } from "@/components/check/check-wizard";

type CheckPageProps = {
  searchParams: Promise<{ goal?: string }>;
};

export const metadata = {
  title: "Eligibility check",
  description:
    "Find out in 60 seconds if you can study in Germany — Pakistan rules for Master's, Bachelor's and Ausbildung.",
};

export default async function CheckPage({ searchParams }: CheckPageProps) {
  const params = await searchParams;
  return <CheckWizard initialGoal={params.goal ?? null} />;
}

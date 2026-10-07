import { CostCalculatorForm } from "@/components/tools/cost-calculator-form";

export const metadata = {
  title: "Cost calculator",
  description:
    "Rough living and university cost estimate for studying in Germany as a Pakistani student.",
};

export default function CostCalculatorPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 md:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">Tools</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em]">
          Cost calculator
        </h1>
        <p className="mt-3 text-muted-foreground">
          A simple planning estimate — not a visa or blocked-account guarantee.
        </p>
      </div>
      <section className="mt-8 rounded-2xl bg-white p-6 shadow-card">
        <CostCalculatorForm />
      </section>
    </div>
  );
}

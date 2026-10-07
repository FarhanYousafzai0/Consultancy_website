import { GradeConverterForm } from "@/components/tools/grade-converter-form";

export const metadata = {
  title: "Grade converter",
  description:
    "Convert Pakistani percentage or CGPA to a German grade using the modified Bavarian formula.",
};

export default function GradeConverterPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 md:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">Tools</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em]">
          Grade converter
        </h1>
        <p className="mt-3 text-muted-foreground">
          Pakistani percentage or CGPA → approximate German grade (1.0 best, 4.0
          pass).
        </p>
      </div>
      <section className="mt-8 rounded-2xl bg-white p-6 shadow-card">
        <GradeConverterForm />
      </section>
    </div>
  );
}

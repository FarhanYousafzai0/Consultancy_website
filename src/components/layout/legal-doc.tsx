export function LegalDoc({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 pb-28 pt-8 md:px-6 md:pb-16 md:pt-12">
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
        Legal
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated 6 October 2026</p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-foreground/85 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_p]:text-foreground/80 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}

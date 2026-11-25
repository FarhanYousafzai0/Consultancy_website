import { ClockCountdown } from "@phosphor-icons/react/ssr";
import { cn } from "cn";

export function ComingSoon({
  title = "Coming soon",
  description = "This part of Parwaaz is being prepared. Check back soon for the verified details.",
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border bg-muted/60 p-6 text-center",
        className
      )}
    >
      <span className="mx-auto grid size-11 place-items-center rounded-full bg-primary text-ink">
        <ClockCountdown weight="bold" className="size-5" aria-hidden />
      </span>
      <h2 className="mt-4 text-lg font-extrabold tracking-[-0.02em]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

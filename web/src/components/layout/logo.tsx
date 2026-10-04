import Image from "next/image";
import Link from "next/link";
import { cn } from "cn";
import { site } from "@/lib/site";

export function Logo({
  variant = "dark",
  className,
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  return (
    <Link href="/" aria-label={`${site.name} home`} className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src={variant === "light" ? "/logo-light.png" : "/logo.png"}
        alt={site.name}
        width={1996}
        height={641}
        priority={variant === "dark"}
        className="h-11 w-auto md:h-12"
      />
    </Link>
  );
}

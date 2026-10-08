import Image from "next/image";
import Link from "next/link";
import { cn } from "cn";
import { site } from "@/lib/site";

const LOGO_SRC = "/parwaz-winged-logo.png";

export function Logo({
  variant = "dark",
  className,
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} home`}
      className={cn(
        "inline-flex shrink-0 items-center",
        variant === "light" && "rounded-xl bg-white px-2.5 py-1.5",
        className
      )}
    >
      <Image
        src={LOGO_SRC}
        alt={site.name}
        width={2172}
        height={724}
        priority={variant === "dark"}
        className="h-11 w-auto md:h-12"
      />
    </Link>
  );
}

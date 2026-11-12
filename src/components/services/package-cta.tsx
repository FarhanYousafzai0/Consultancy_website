import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ServicePackage } from "@/data/services";
import { whatsappLink } from "@/lib/site";

/** "Get started" for a package: internal page when `href` is set, otherwise WhatsApp. */
export function PackageCta({
  pkg,
  className,
  size,
}: {
  pkg: ServicePackage;
  className?: string;
  size?: "default" | "lg";
}) {
  return (
    <Button asChild size={size} variant="dark" className={className}>
      {pkg.href ? (
        <Link href={pkg.href}>Get started</Link>
      ) : (
        <a
          href={whatsappLink(pkg.whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Get started
        </a>
      )}
    </Button>
  );
}

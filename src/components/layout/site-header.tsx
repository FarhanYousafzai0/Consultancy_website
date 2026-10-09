import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { mainNav } from "./nav-links";
import { getSession } from "@/lib/auth/session";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 px-1.5 pt-2 md:px-2 md:pt-3">
      <div
        data-site-header-bar
        className="mx-auto flex h-[72px] max-w-[90rem] items-center justify-between gap-6 rounded-2xl border border-border bg-background/95 px-4 shadow-card backdrop-blur-md md:px-6"
      >
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild size="sm" className="pr-1.5">
                <Link href="/dashboard/profile">
                  Profile
                  <span className="grid size-6 place-items-center rounded-full bg-ink text-primary">
                    <ArrowUpRight weight="bold" className="size-3.5" />
                  </span>
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="pr-1.5">
                <Link href="/check">
                  Check eligibility
                  <span className="grid size-6 place-items-center rounded-full bg-ink text-primary">
                    <ArrowUpRight weight="bold" className="size-3.5" />
                  </span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { getSession } from "@/lib/auth/session";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 px-1.5 pt-2 md:px-2 md:pt-3">
      <div
        data-site-header-bar
        className="mx-auto flex h-[72px] max-w-[90rem] items-center justify-between gap-2 rounded-2xl border border-border bg-background/95 px-3 shadow-card sm:gap-4 sm:px-4 backdrop-blur-md md:px-6"
      >
        <Logo />
        <MainNav />
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
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
              <Button asChild variant="ghost" size="sm" className="hidden xl:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link href="/consultation">Request consultation</Link>
              </Button>
              <Button asChild size="sm" className="group pr-1.5">
                <Link href="/check">
                  Check eligibility
                  <span className="grid size-6 place-items-center rounded-full bg-ink text-primary transition-transform duration-200 group-hover:rotate-45">
                    <ArrowUpRight weight="bold" className="size-3.5" />
                  </span>
                </Link>
              </Button>
            </>
          )}
          <MobileNav signedIn={!!session} />
        </div>
      </div>
    </header>
  );
}

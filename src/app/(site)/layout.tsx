import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AdvisorChat } from "@/components/advisor/advisor-chat";

/** Session + DB-backed pages must not prerender at build (no MONGODB_URI on Vercel build). */
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <MobileTabBar />
      <AdvisorChat />
    </>
  );
}

import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { whatsappLink } from "@/lib/site";

export function WhatsAppFab() {
  return (
    <Link
      href={whatsappLink("Hi! I'd like help applying to Germany.")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-24 z-40 inline-flex items-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-sm font-semibold text-ink shadow-[0_8px_24px_rgb(37_211_102/0.35)] transition-transform hover:scale-105 md:right-6 md:bottom-6"
    >
      <WhatsAppIcon className="size-5 text-white" />
      Let&apos;s have a chat!
    </Link>
  );
}

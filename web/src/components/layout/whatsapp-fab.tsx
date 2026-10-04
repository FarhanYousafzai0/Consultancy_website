import { WhatsappLogo } from "@phosphor-icons/react/ssr";
import { whatsappLink } from "@/lib/site";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink("Hi! I'd like help applying to Germany.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ask a consultant on WhatsApp"
      className="fixed right-4 bottom-24 z-40 grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_8px_24px_rgb(37_211_102/0.35)] transition-transform hover:scale-105 md:right-6 md:bottom-6"
    >
      <WhatsappLogo weight="fill" className="size-7" />
    </a>
  );
}

export const site = {
  name: "Parwaaz Consultancy",
  description:
    "Find out in 60 seconds if you can study in Germany — and which programs you can actually get into. Verified data. Real consultants.",
  whatsappNumber: configuredWhatsAppNumber(),
};

export const DEFAULT_COMMUNITY_WHATSAPP_URL =
  "https://chat.whatsapp.com/LyI0KwC5A8PBJIvFi43yj6";

function configuredWhatsAppNumber() {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ?? "";
  if (!raw || !/^[+\d\s().-]+$/.test(raw)) return null;

  const number = raw.replace(/\D/g, "");
  return /^[1-9]\d{7,14}$/.test(number) ? number : null;
}

export function whatsappLink(message: string): string | null {
  if (!site.whatsappNumber) return null;
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function safeHttpsUrl(value: string | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function safeWhatsAppUrl(value: string | undefined): string | null {
  const url = safeHttpsUrl(value);
  if (!url) return null;

  const hostname = new URL(url).hostname;
  return hostname === "wa.me" || hostname.endsWith(".whatsapp.com") ? url : null;
}

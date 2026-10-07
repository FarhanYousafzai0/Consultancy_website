export const site = {
  name: "Parwaaz Consultancy",
  description:
    "Find out in 60 seconds if you can study in Germany — and which programs you can actually get into. Verified data. Real consultants.",
  whatsappNumber: "923000000000",
};

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

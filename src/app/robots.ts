import type { MetadataRoute } from "next";

function siteOrigin() {
  return (
    process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/api"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}

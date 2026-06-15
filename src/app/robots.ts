import type { MetadataRoute } from "next";

const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/game", "/sign-in", "/sign-up"],
    },
    sitemap: new URL("/sitemap.xml", appBaseUrl).toString(),
  };
}

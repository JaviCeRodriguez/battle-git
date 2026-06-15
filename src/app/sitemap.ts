import type { MetadataRoute } from "next";

const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: new URL("/", appBaseUrl).toString(),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/demo", appBaseUrl).toString(),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}

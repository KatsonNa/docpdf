import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://docpdf.vercel.app";
  return [
    { url: base, lastModified: new Date(), priority: 1 },
    { url: `${base}/merge-pdf`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/compress-pdf`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/pdf-to-jpg`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/privacy`, lastModified: new Date(), priority: 0.5 },
    { url: `${base}/terms`, lastModified: new Date(), priority: 0.5 },
    { url: `${base}/about`, lastModified: new Date(), priority: 0.5 },
  ];
}
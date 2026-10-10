import type { MetadataRoute } from "next";
import { sitemapFile } from "@/site/seo";

/* /sitemap.xml — the pages of the released languages, and only those (site/seo.ts). */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapFile();
}

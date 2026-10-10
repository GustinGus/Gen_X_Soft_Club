import type { MetadataRoute } from "next";
import { robotsFile } from "@/site/seo";

/* /robots.txt — what it says is decided by where the site is built (site/seo.ts). */
export default function robots(): MetadataRoute.Robots {
  return robotsFile();
}

import { RootDocument, siteMetadata } from "@/site/layout";

/* English, the original: at the root. Everything a document is made of is in site/layout. */
const locale = "en";

export { viewport } from "@/site/layout";

export const generateMetadata = () => siteMetadata(locale);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootDocument locale={locale}>{children}</RootDocument>;
}

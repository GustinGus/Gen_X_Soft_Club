import { RootDocument, siteMetadata } from "@/site/layout";

/* Brazilian Portuguese: under /pt-br. Everything a document is made of is in site/layout. */
const locale = "pt-br";

export { viewport } from "@/site/layout";

export const generateMetadata = () => siteMetadata(locale);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootDocument locale={locale}>{children}</RootDocument>;
}

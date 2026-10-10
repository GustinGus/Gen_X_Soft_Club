import { indexMetadata, indexPage } from "@/site/routes";

const locale = "en";

export const generateMetadata = () => indexMetadata(locale);

export default function MusicIndexPage() {
  return indexPage(locale);
}

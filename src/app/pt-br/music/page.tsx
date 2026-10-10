import { indexMetadata, indexPage } from "@/site/routes";

const locale = "pt-br";

export const generateMetadata = () => indexMetadata(locale);

export default function MusicIndexPage() {
  return indexPage(locale);
}

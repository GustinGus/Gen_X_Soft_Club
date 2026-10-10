import { HomeExperience } from "@/components/home/HomeExperience";
import { homeMetadata } from "@/site/routes";

const locale = "pt-br";

export const generateMetadata = () => homeMetadata(locale);

export default function HomePage() {
  return <HomeExperience />;
}

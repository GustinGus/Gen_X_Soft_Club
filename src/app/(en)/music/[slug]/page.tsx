import { recordMetadata, recordPage, recordParams } from "@/site/routes";

const locale = "en";

type Props = { params: Promise<{ slug: string }> };

/** The archive is closed: twelve files, nothing generated on demand. */
export const dynamicParams = false;

export const generateStaticParams = recordParams;

export const generateMetadata = async ({ params }: Props) => recordMetadata(locale, (await params).slug);

export default async function RecordPage({ params }: Props) {
  return recordPage(locale, (await params).slug);
}

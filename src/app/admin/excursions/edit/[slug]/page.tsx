import { getExcursionBySlug } from "@/app/server-actions.readonly";
import ExcursionEditor from "../../excursion-editor";
import { notFound } from "next/navigation";

export const revalidate = 0; // Ensures data is always fresh

export default async function EditExcursionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const excursion = await getExcursionBySlug(slug);

  if (!excursion) {
    notFound();
  }

  return <ExcursionEditor excursionData={excursion} />;
}

import { getExcursionBySlug } from "@/app/server-actions.readonly";
import ExcursionEditor from "../../excursion-editor";
import { notFound } from "next/navigation";

export const revalidate = 0; // Ensures data is always fresh

export default async function EditExcursionPage({
  params,
}: {
  params: { slug: string };
}) {
  const excursion = await getExcursionBySlug(params.slug);

  if (!excursion) {
    notFound();
  }

  return <ExcursionEditor excursionData={excursion} />;
}

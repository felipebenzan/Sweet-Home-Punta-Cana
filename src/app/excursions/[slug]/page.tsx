import {
  getExcursionBySlug,
  getExcursions,
} from "@/server-actions";
import type { Metadata } from "@/lib/types";
import { notFound } from "next/navigation";
import ExcursionClientPage from "./excursion-client-page";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const excursion = await getExcursionBySlug(params.slug);

  if (!excursion) {
    return {
      title: "Excursion Not Found",
      description: "The requested excursion could not be found.",
    };
  }

  return {
    title: `${excursion.title} | Sweet Home Punta Cana`,
    description: excursion.description,
    openGraph: {
      title: `${excursion.title} | Sweet Home Punta Cana`,
      description: excursion.description,
      images: [{ url: excursion.image }],
    },
  };
}

export default async function ExcursionPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const excursionData = await getExcursionBySlug(slug);

  if (!excursionData) {
    notFound();
  }

  const allExcursions = await getExcursions();
  const otherExcursions = allExcursions.filter(
    (e) => e.id !== excursionData.id
  );

  return (
    <ExcursionClientPage
      excursion={excursionData}
      otherExcursions={otherExcursions}
    />
  );
}

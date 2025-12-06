import {
  getExcursionBySlug,
  getExcursions,
} from "@/app/server-actions.readonly";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ExcursionClientPage from "./excursion-client-page";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const excursion = await getExcursionBySlug(slug);

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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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

import { getRoomBySlug } from "@/server-actions";
import type { Metadata } from "@/lib/types";
import { notFound } from "next/navigation";
import RoomClientPage from "./room-client-page";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const room = await getRoomBySlug(params.slug);
  if (!room) {
    return {
      title: "Room Not Found",
      description: "The requested room could not be found.",
    };
  }

  return {
    title: `${room.name} | Sweet Home Punta Cana`,
    description:
      room.description ||
      `Book the ${room.name} at Sweet Home Punta Cana. An affordable, adults-only guest house near Bávaro Beach.`,
    openGraph: {
      title: `${room.name} | Sweet Home Punta Cana`,
      description:
        room.description ||
        `Book the ${room.name} at Sweet Home Punta Cana. An affordable, adults-only guest house near Bávaro Beach.`,
      images: [{ url: room.image }],
    },
  };
}

export default async function RoomPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const roomData = await getRoomBySlug(slug);

  if (!roomData) {
    notFound();
  }

  return <RoomClientPage roomData={roomData} />;
}

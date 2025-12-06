import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RoomClientPage from "./room-client-page";
import type { Room } from "@/lib/types";
import { getRooms, getRoomBySlug } from "@/app/server-actions.readonly";

export const revalidate = 0; // Disable cache for instant updates

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);
  if (!room) {
    return {
      title: "Room Not Found",
    };
  }

  return {
    title: `${room.name} | Sweet Home Punta Cana`,
    description:
      room.description ||
      `Book the ${room.name} at Sweet Home Punta Cana. An affordable guest house near Bávaro Beach.`,
    openGraph: {
      images: [{ url: room.image }],
    },
  };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch all required data in parallel on the server
  const [roomData, allRooms] = await Promise.all([
    getRoomBySlug(slug),
    getRooms(),
  ]);

  if (!roomData) {
    notFound();
  }

  // Prepare the list of other rooms, excluding the current one
  const otherRooms = allRooms.filter((r: Room) => r.slug !== slug);

  // Pass all data down to the client component
  return <RoomClientPage roomData={roomData} otherRooms={otherRooms} />;
}

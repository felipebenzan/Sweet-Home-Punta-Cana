import type { Metadata } from "@/lib/types";
import { notFound } from "next/navigation";
import RoomClientPage from "./room-client-page";
import { Room } from "@/lib/types";
import { readFile } from "fs/promises";
import { join } from "path";

export const revalidate = 3600; // Revalidate page data every hour

async function getRooms(): Promise<Room[]> {
  try {
    const roomsPath = join(process.cwd(), 'src', 'data', 'rooms.json');
    const fileContent = await readFile(roomsPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return [];
  }
}

async function getRoomBySlug(slug: string): Promise<Room | null> {
  const rooms = await getRooms();
  return rooms.find(r => r.slug === slug) || null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const room = await getRoomBySlug(params.slug);
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
  params: { slug: string };
}) {
  const { slug } = params;

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

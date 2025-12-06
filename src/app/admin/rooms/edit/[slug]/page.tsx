
import { prisma } from '@/lib/prisma';
import RoomEditor from '../../room-editor';
// import { getRoomBySlug } from '@/server-actions'; // Or use direct prisma since it is server component

export default async function EditRoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const room = await prisma.room.findUnique({
    where: { slug }
  });

  const parsedRoom = room ? {
    ...room,
    tagline: room.tagline || undefined,
    description: room.description || undefined,
    beds24_room_id: room.beds24_room_id || undefined,
    bedding: room.bedding as any,
    cancellationPolicy: room.cancellationPolicy || undefined,
    amenities: JSON.parse(room.amenities),
    gallery: room.gallery ? JSON.parse(room.gallery) : [],
  } : null;

  return <RoomEditor slug={slug} initialData={parsedRoom} />;
}

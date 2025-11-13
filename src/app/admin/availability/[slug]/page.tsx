
import RoomAvailabilityEditor from '../room-availability-editor';

export default function EditRoomAvailabilityPage({ params }: { params: { slug: string } }) {
  // We'll pass the slug to the editor
  // and the editor can find the mock data or fetch real data.
  return <RoomAvailabilityEditor slug={params.slug} />;
}

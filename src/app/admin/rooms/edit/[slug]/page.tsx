
import RoomEditor from '../../room-editor';

export default function EditRoomPage({ params }: { params: { slug: string } }) {
  // In a real app, you would fetch the room data based on the slug
  // For this prototype, we'll pass the slug to the editor
  // and the editor can find the mock data.
  return <RoomEditor slug={params.slug} />;
}

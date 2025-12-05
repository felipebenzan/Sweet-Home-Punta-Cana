import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RoomAvailabilityEditor from './room-availability-editor';

export default async function AvailabilityPage() {
  const session = await verifySession();

  if (!session) {
    redirect('/admin/login');
  }

  // Redirect to room bookings calendar
  redirect('/admin/bookings/rooms/calendar');
}

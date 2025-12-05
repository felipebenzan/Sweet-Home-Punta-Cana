import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ServiceBookingsClient from './service-bookings-client';
import { getServiceBookings } from '@/server-actions';

export default async function GuestServicesPage() {
  const session = await verifySession();

  if (!session) {
    redirect('/admin/login');
  }

  // Redirect to service bookings
  redirect('/admin/bookings/services');
}

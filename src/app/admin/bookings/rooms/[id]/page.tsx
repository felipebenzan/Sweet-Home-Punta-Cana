import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Bed, Calendar, User, Mail, Phone, CreditCard, Users } from 'lucide-react';
import Link from 'next/link';
import { DeleteBookingButton } from '../../delete-booking-button';

export const dynamic = 'force-dynamic';

async function getRoomReservation(id: string) {
    try {
        const booking = await prisma.reservation.findUnique({
            where: { id },
            include: { room: true }
        });
        return booking;
    } catch (e) {
        console.warn('Build-time DB fetch failed or Reservation not found', e);
        return null;
    }
}

export default async function RoomBookingDetailPage({ params }: { params: { id: string } }) {
    const session = await verifySession();

    if (!session) {
        redirect('/admin/login');
    }

    const booking = await getRoomReservation(params.id);

    if (!booking) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-red-500">Booking not found</h1>
                <Link href="/admin/bookings/services/calendar">
                    <Button variant="outline" className="mt-4">Back to Calendar</Button>
                </Link>
            </div>
        );
    }

    const nights = Math.ceil((booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="p-4 sm:p-6 bg-shpc-sand min-h-full">
            <div className="mb-6">
                <Link href="/admin/bookings/services/calendar">
                    <Button variant="ghost" className="mb-4">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Calendar
                    </Button>
                </Link>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Bed className="h-6 w-6 text-blue-500" />
                        <h1 className="text-3xl font-bold">Room Reservation</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <DeleteBookingButton bookingId={booking.id} bookingType="room" />
                        <Badge variant={booking.status === 'Confirmed' ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                            {booking.status}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Guest Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.guestName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${booking.guestEmail}`} className="text-blue-600 hover:underline">{booking.guestEmail}</a>
                        </div>
                        {booking.guestPhone && (
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <a href={`tel:${booking.guestPhone}`} className="text-blue-600 hover:underline">{booking.guestPhone}</a>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.numberOfGuests} Guests</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Reservation Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Reservation Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Bed className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.room.name}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                            <div>
                                <p className="text-sm text-muted-foreground">Check-in</p>
                                <p className="font-medium">{booking.checkInDate.toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Check-out</p>
                                <p className="font-medium">{booking.checkOutDate.toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="font-medium">{nights} Night(s)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Total Amount</span>
                            <span>${booking.totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                            <p>Reservation ID: {booking.id}</p>
                            <p>Created: {booking.createdAt.toLocaleDateString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

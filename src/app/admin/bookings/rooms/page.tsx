import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DeleteBookingButton } from '../delete-booking-button';

async function getBookings() {
    try {
        const reservations = await prisma.reservation.findMany({
            include: { room: true },
            orderBy: { createdAt: 'desc' }
        });

        // Map Prisma reservations to the UI structure expected by the component
        return reservations.map((r) => ({
            confirmationId: r.id,
            createdAt: r.createdAt.toISOString(),
            // Guest Details
            guestName: r.guestName,
            guestEmail: r.guestEmail,
            customer: {
                name: r.guestName,
                email: r.guestEmail,
                phone: r.guestPhone || ''
            },
            // Pricing & Dates
            totalPrice: r.totalPrice,
            dates: {
                checkIn: r.checkInDate.toISOString().split('T')[0],
                checkOut: r.checkOutDate.toISOString().split('T')[0]
            },
            guests: r.numberOfGuests,
            // Wrap single room in array for UI consistency
            rooms: r.room ? [{ name: r.room.name }] : [],
            type: 'room'
        }));
    } catch (error) {
        console.error("Failed to fetch bookings:", error);
        return [];
    }
}

export default async function RoomBookingsPage() {
    const session = await verifySession();

    if (!session) {
        redirect('/admin/login');
    }

    const bookings = await getBookings();

    return (
        <div className="p-4 sm:p-6 bg-shpc-sand min-h-full">
            <div className="mb-8">
                <Link href="/admin">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Room Bookings</h1>
                        <p className="text-muted-foreground">View all room reservations</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/admin/bookings/rooms/calendar">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Calendar View
                        </Link>
                    </Button>
                </div>
            </div>

            {bookings.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No room bookings yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking: any) => (
                        <Card key={booking.confirmationId} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-blue-100 text-blue-800">
                                                <Home className="h-4 w-4 mr-1" />
                                                Room Booking
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(booking.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <CardTitle className="text-lg">
                                            {booking.guestName || booking.customer?.name || 'Guest'}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {booking.guestEmail || booking.customer?.email}
                                        </p>
                                        {booking.customer?.phone && (
                                            <p className="text-sm text-muted-foreground">
                                                📱 {booking.customer.phone}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">${booking.totalPrice?.toFixed(2)}</p>
                                        <div className="flex items-center justify-end gap-2 mt-1">
                                            <p className="text-xs text-muted-foreground">
                                                ID: {booking.confirmationId}
                                            </p>
                                            <DeleteBookingButton
                                                bookingId={booking.confirmationId}
                                                bookingType="room"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {booking.dates && (
                                    <div className="space-y-2 text-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-muted-foreground">Check-in</p>
                                                <p className="font-semibold">{booking.dates.checkIn}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Check-out</p>
                                                <p className="font-semibold">{booking.dates.checkOut}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <p className="text-muted-foreground">Guests</p>
                                                <p className="font-semibold">{booking.guests}</p>
                                            </div>
                                            {booking.rooms && (
                                                <div>
                                                    <p className="text-muted-foreground">Rooms</p>
                                                    <p className="font-semibold">{booking.rooms.map((r: any) => r.name).join(', ')}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {booking.paypalTransactionId && (
                                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                                        <p>PayPal Transaction: {booking.paypalTransactionId}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

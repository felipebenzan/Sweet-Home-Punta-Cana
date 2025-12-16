import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
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
                        <Card key={booking.confirmationId} className="hover:shadow-lg transition-shadow group">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/bookings/rooms/${booking.confirmationId}`} className="hover:underline focus:underline decoration-2 underline-offset-2 rounded-md">
                                                <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
                                                    {booking.guestName || booking.customer?.name || 'Guest'}
                                                </h3>
                                            </Link>
                                            <Badge variant={booking.type === 'room' ? 'default' : 'secondary'}>
                                                {booking.type === 'room' ? 'Room' : booking.type}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(booking.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                            <p className="text-sm text-muted-foreground">
                                                {booking.guestEmail || booking.customer?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-shpc-ink">${booking.totalPrice?.toFixed(2)}</p>
                                        <div className="flex items-center justify-end gap-2 mt-2">
                                            <Link href={`/confirmation?bid=${booking.confirmationId}`} target="_blank">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-blue-600" title="View Public Confirmation">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <p className="text-xs text-muted-foreground font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                                {booking.confirmationId.substring(0, 8)}...
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
                                <Link href={`/admin/bookings/rooms/${booking.confirmationId}`} className="block">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-blue-50/30 transition-colors">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Check-in</p>
                                            <p className="font-medium text-sm">{booking.dates.checkIn}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Check-out</p>
                                            <p className="font-medium text-sm">{booking.dates.checkOut}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Guests</p>
                                            <p className="font-medium text-sm">{booking.guests}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Room</p>
                                            <p className="font-medium text-sm truncate" title={booking.rooms?.[0]?.name}>
                                                {booking.rooms?.[0]?.name || 'Unassigned'}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                                {booking.paypalTransactionId && (
                                    <div className="mt-3 text-xs text-muted-foreground flex gap-1 items-center px-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                        PayPal: {booking.paypalTransactionId}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                    }
                </div >
            )}
        </div >
    );
}

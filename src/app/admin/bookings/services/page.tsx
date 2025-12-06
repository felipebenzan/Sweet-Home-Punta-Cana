import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plane, Shirt, Calendar as CalendarIcon, MapPin, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DeleteBookingButton } from '../delete-booking-button';

async function getBookings() {
    try {
        const bookings = await prisma.serviceBooking.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                excursion: true
            }
        });
        return bookings;
    } catch (error) {
        console.error('Failed to fetch service bookings:', error);
        return [];
    }
}

function getServiceIcon(type: string) {
    switch (type) {
        case 'transfer':
        case 'airport_transfer': return <Briefcase className="h-4 w-4" />;
        case 'laundry': return <Shirt className="h-4 w-4" />;
        case 'excursion': return <Plane className="h-4 w-4" />; // Or Tree
        default: return null;
    }
}

function getServiceBadge(type: string) {
    const normalizedType = type === 'airport_transfer' ? 'transfer' : type;
    const colors: Record<string, string> = {
        transfer: 'bg-green-100 text-green-800',
        laundry: 'bg-purple-100 text-purple-800',
        excursion: 'bg-orange-100 text-orange-800',
    };

    return (
        <Badge className={colors[normalizedType] || 'bg-gray-100 text-gray-800'}>
            {getServiceIcon(normalizedType)}
            <span className="ml-1 capitalize">{normalizedType}</span>
        </Badge>
    );
}

export default async function ServiceBookingsPage() {
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
                        <h1 className="text-3xl font-bold">Service Bookings</h1>
                        <p className="text-muted-foreground">Airport transfers, laundry, and excursions</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/admin/bookings/services/calendar">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Calendar View
                        </Link>
                    </Button>
                </div>
            </div>

            {bookings.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Plane className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No service bookings found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => {
                        // Parse details if it's a string, or use as is if it's an object/null
                        // Prisma types details as Json, which can be any valid JSON value
                        const details: any = typeof booking.details === 'string'
                            ? JSON.parse(booking.details)
                            : booking.details || {};

                        const total = booking.total ?? 0;

                        return (
                            <Card key={booking.id} className="hover:shadow-lg transition-shadow group relative">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                {getServiceBadge(booking.type)}
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

                                            <Link href={`/admin/bookings/${booking.id}`} className="block">
                                                <CardTitle className="text-lg text-blue-600 group-hover:underline cursor-pointer">
                                                    {booking.guestName || 'Guest'}
                                                </CardTitle>
                                            </Link>

                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>{booking.email}</p>
                                                {booking.phone && <p>📱 {booking.phone}</p>}
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <p className="text-2xl font-bold">${total.toFixed(2)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                ID: {booking.id.substring(0, 8)}...
                                            </p>
                                            <DeleteBookingButton bookingId={booking.id} bookingType={booking.type} />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Link href={`/admin/bookings/${booking.id}`} className="block">
                                        {/* Transfer Details */}
                                        {(booking.type === 'transfer' || booking.type === 'airport_transfer') && details && (
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <p><strong>Direction:</strong> {details.direction}</p>
                                                {details.arrivalDate && (
                                                    <p><strong>Arrival:</strong> {details.arrivalDate} - Flight {details.arrivalFlight}</p>
                                                )}
                                                {details.departureDate && (
                                                    <p><strong>Departure:</strong> {details.departureDate} at {details.departureTime}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Laundry Details */}
                                        {booking.type === 'laundry' && details && (
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <p><strong>Bags:</strong> {details.bags}</p>
                                                <p><strong>Pickup:</strong> {details.pickupTime || 'Not specified'}</p>
                                            </div>
                                        )}

                                        {/* Excursion Details */}
                                        {booking.type === 'excursion' && details && (
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <p><strong>Tour:</strong> {details.title || booking.excursion?.title || 'Excursion'}</p>
                                                {booking.date && <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>}
                                            </div>
                                        )}
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

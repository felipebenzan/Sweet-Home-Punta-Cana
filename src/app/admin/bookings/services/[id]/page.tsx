import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plane, Shirt, MapPin, Calendar, Clock, User, Mail, Phone, CreditCard } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getServiceBooking(id: string) {
    try {
        const booking = await prisma.serviceBooking.findUnique({
            where: { id },
        });
        return booking;
    } catch (e) {
        console.warn('Build-time DB fetch failed or Booking not found', e);
        return null;
    }
}

export default async function ServiceBookingDetailPage({ params }: { params: { id: string } }) {
    const session = await verifySession();

    if (!session) {
        redirect('/admin/login');
    }

    const booking = await getServiceBooking(params.id);

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

    let details: any = {};
    try {
        details = booking.details ? JSON.parse(booking.details) : {};
    } catch (e) {
        console.error('Error parsing details', e);
    }

    const getServiceIcon = () => {
        switch (booking.type) {
            case 'airport_transfer': return <Plane className="h-6 w-6 text-green-500" />;
            case 'laundry': return <Shirt className="h-6 w-6 text-purple-500" />;
            case 'excursion': return <MapPin className="h-6 w-6 text-orange-500" />;
            default: return null;
        }
    };

    const getServiceTitle = () => {
        switch (booking.type) {
            case 'airport_transfer': return 'Airport Transfer';
            case 'laundry': return 'Laundry Service';
            case 'excursion': return 'Excursion';
            default: return booking.type;
        }
    };

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
                        {getServiceIcon()}
                        <h1 className="text-3xl font-bold">{getServiceTitle()} Booking</h1>
                    </div>
                    <Badge variant={booking.status === 'Confirmed' ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                        {booking.status}
                    </Badge>
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
                        {booking.email && (
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a href={`mailto:${booking.email}`} className="text-blue-600 hover:underline">{booking.email}</a>
                            </div>
                        )}
                        {booking.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <a href={`tel:${booking.phone}`} className="text-blue-600 hover:underline">{booking.phone}</a>
                            </div>
                        )}
                        {booking.pax && (
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{booking.pax}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Booking Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Service Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {booking.date && (
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                    {booking.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                        )}

                        {/* Transfer Specifics */}
                        {booking.type === 'airport_transfer' && (
                            <div className="space-y-2 mt-4 pt-4 border-t">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Direction</p>
                                        <p className="font-medium capitalize">{details.direction === 'arrive' ? 'Arrival' : 'Departure'}</p>
                                    </div>

                                    {(details.flightNumber || details.arrivalFlight || details.departureFlight) && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Flight Number</p>
                                            <p className="font-medium">
                                                {details.flightNumber || details.arrivalFlight || details.departureFlight}
                                            </p>
                                        </div>
                                    )}

                                    {(details.airline || details.arrivalAirline) && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Airline</p>
                                            <p className="font-medium">{details.airline || details.arrivalAirline}</p>
                                        </div>
                                    )}

                                    {details.direction === 'arrive' && details.arrivalDate && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Arrival Date</p>
                                            <p className="font-medium">
                                                {new Date(details.arrivalDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    )}

                                    {details.direction === 'depart' && details.departureDate && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Departure Date</p>
                                            <p className="font-medium">
                                                {new Date(details.departureDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    )}

                                    {details.pickupTime && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Pickup Time</p>
                                            <p className="font-medium">{details.pickupTime}</p>
                                        </div>
                                    )}

                                    {details.passengers && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Passengers</p>
                                            <p className="font-medium">{details.passengers}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Laundry Specifics */}
                        {booking.type === 'laundry' && (
                            <div className="space-y-2 mt-4 pt-4 border-t">
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="text-muted-foreground">Bags:</span>
                                    <span className="font-medium">{details.bags}</span>

                                    <span className="text-muted-foreground">Room Number:</span>
                                    <span className="font-medium">{details.roomNumber}</span>

                                    <span className="text-muted-foreground">Pickup Time:</span>
                                    <span className="font-medium">{details.pickupTime}</span>
                                </div>
                            </div>
                        )}

                        {/* Excursion Specifics */}
                        {booking.type === 'excursion' && (
                            <div className="space-y-2 mt-4 pt-4 border-t">
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="text-muted-foreground">Excursion:</span>
                                    <span className="font-medium">{details.title}</span>

                                    <span className="text-muted-foreground">Pickup Location:</span>
                                    <span className="font-medium">{details.pickupLocation || 'Lobby'}</span>
                                </div>
                            </div>
                        )}
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
                            <span>${booking.total?.toFixed(2)}</span>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                            <p>Booking ID: {booking.id}</p>
                            <p>Created: {booking.createdAt.toLocaleDateString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

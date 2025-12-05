import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { readFile } from 'fs/promises';
import { join } from 'path';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plane, Shirt, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

async function getBookings() {
    try {
        const bookingsPath = join(process.cwd(), 'src', 'data', 'bookings.json');
        const fileContent = await readFile(bookingsPath, 'utf-8');
        const bookings = JSON.parse(fileContent);
        // Filter only service bookings (transfer, laundry, excursion)
        return bookings
            .filter((b: any) => ['transfer', 'laundry', 'excursion'].includes(b.type))
            .sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
    } catch (error) {
        return [];
    }
}

function getServiceIcon(type: string) {
    switch (type) {
        case 'transfer': return <Plane className="h-4 w-4" />;
        case 'laundry': return <Shirt className="h-4 w-4" />;
        case 'excursion': return <MapPin className="h-4 w-4" />;
        default: return null;
    }
}

function getServiceBadge(type: string) {
    const colors: Record<string, string> = {
        transfer: 'bg-green-100 text-green-800',
        laundry: 'bg-purple-100 text-purple-800',
        excursion: 'bg-orange-100 text-orange-800',
    };

    return (
        <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
            {getServiceIcon(type)}
            <span className="ml-1 capitalize">{type}</span>
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
                        <p className="text-muted-foreground">No service bookings yet</p>
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
                                        <p className="text-xs text-muted-foreground">
                                            ID: {booking.confirmationId}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Transfer Details */}
                                {booking.type === 'transfer' && booking.details && (
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Direction:</strong> {booking.details.direction}</p>
                                        {booking.details.arrivalDate && (
                                            <p><strong>Arrival:</strong> {booking.details.arrivalDate} - Flight {booking.details.arrivalFlight}</p>
                                        )}
                                        {booking.details.departureDate && (
                                            <p><strong>Departure:</strong> {booking.details.departureDate} at {booking.details.departureTime}</p>
                                        )}
                                    </div>
                                )}

                                {/* Laundry Details */}
                                {booking.type === 'laundry' && booking.details && (
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Bags:</strong> {booking.details.bags}</p>
                                        <p><strong>Price per bag:</strong> ${booking.details.pricePerBag}</p>
                                    </div>
                                )}

                                {/* Excursion Details */}
                                {booking.type === 'excursion' && booking.details && (
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Tour:</strong> {booking.details.title || 'Excursion'}</p>
                                        {booking.details.date && <p><strong>Date:</strong> {booking.details.date}</p>}
                                        {booking.details.guests && <p><strong>Guests:</strong> {booking.details.guests}</p>}
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

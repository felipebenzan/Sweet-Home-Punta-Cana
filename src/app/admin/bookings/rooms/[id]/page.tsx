
import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Bed, Calendar as CalendarIcon, User, Mail, Phone, CreditCard, Users as UsersIcon, Clock, CheckCircle, Home, MapPin } from 'lucide-react';
import Link from 'next/link';
import { DeleteBookingButton } from '../../delete-booking-button';
import QRCode from "react-qr-code";
import { format } from "date-fns";
import Image from "next/image";

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

export default async function RoomBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await verifySession();

    if (!session) {
        redirect('/admin/login');
    }

    const { id } = await params;
    const booking = await getRoomReservation(id);

    if (!booking) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-red-500">Booking not found</h1>
                <Link href="/admin/bookings/rooms">
                    <Button variant="outline" className="mt-4">Back to List</Button>
                </Link>
            </div>
        );
    }

    const nights = Math.ceil((booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const shortId = booking.id.substring(0, 8).toUpperCase();

    return (
        <div className="p-4 sm:p-6 bg-shpc-sand min-h-full font-sans text-shpc-ink">
            {/* Header / Admin Controls */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <Link href="/admin/bookings/rooms">
                        <Button variant="ghost" className="-ml-3 text-muted-foreground hover:text-shpc-ink">
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Back to List
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <DeleteBookingButton bookingId={booking.id} bookingType="room" />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-playfair font-bold text-shpc-ink">Room Confirmation</h1>
                            <Badge variant={booking.status === 'Confirmed' ? 'default' : 'secondary'} className="px-3">
                                {booking.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Viewing exact details as sent to the client.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                {/* 1. Reservation Details (Main Card) */}
                <Card className="shadow-soft rounded-3xl overflow-hidden border-none bg-white">
                    <CardHeader className="bg-shpc-yellow/10 border-b border-shpc-yellow/20 p-6">
                        <CardTitle className="flex items-center gap-3 text-2xl font-playfair text-shpc-ink">
                            <span>✅</span> Reservation Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="space-y-6 flex-grow">
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Reservation ID</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-bold text-shpc-ink tracking-tight">{shortId}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-mono mt-1">{booking.id}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Guest Name</p>
                                        <p className="text-lg font-medium">{booking.guestName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Contact Info</p>
                                        <p className="text-lg font-medium truncate" title={booking.guestEmail}>{booking.guestEmail}</p>
                                        {booking.guestPhone && (
                                            <p className="text-sm text-muted-foreground mt-1">{booking.guestPhone}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-3 bg-shpc-sand/50 p-4 rounded-xl border border-shpc-edge">
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <QRCode value={`${shortId} -${booking.room.name} `} size={100} />
                                </div>
                                <p className="text-xs text-center text-muted-foreground max-w-[140px] leading-tight">
                                    Scan for quick check-in
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Your Stay & Room */}
                <Card className="shadow-soft rounded-3xl overflow-hidden border-none bg-white">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-xl font-playfair flex items-center gap-2">
                            📅 Your Stay & Room
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-shpc-yellow" /> Dates</p>
                                <p className="font-medium text-lg">
                                    {format(booking.checkInDate, "MMM dd")} – {format(booking.checkOutDate, "MMM dd, yyyy")}
                                </p>
                                <p className="text-sm text-muted-foreground">({nights} Nights)</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2"><UsersIcon className="w-4 h-4 text-shpc-yellow" /> Guests</p>
                                <p className="font-medium text-lg">{booking.numberOfGuests} {booking.numberOfGuests === 1 ? "Guest" : "Guests"}</p>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <p className="text-sm text-muted-foreground flex items-center gap-2"><Home className="w-4 h-4 text-shpc-yellow" /> Room Type</p>
                                <p className="font-medium text-lg">{booking.room.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-shpc-yellow" /> Check-in Time</p>
                                <p className="font-medium text-lg">3:00 PM</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-shpc-yellow" /> Check-out Time</p>
                                <p className="font-medium text-lg">11:00 AM</p>
                            </div>
                        </div>
                        {booking.room && booking.room.image && (
                            <div className="mt-6">
                                <p className="text-sm text-muted-foreground mb-2 font-medium">Room Preview</p>
                                <div className="relative h-48 w-full sm:w-64 rounded-xl overflow-hidden shadow-sm">
                                    <Image
                                        src={booking.room.image}
                                        alt={booking.room.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 3. Payment Summary */}
                <Card className="shadow-soft rounded-3xl overflow-hidden border-none bg-white">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-xl font-playfair flex items-center gap-2">
                            💰 Payment Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-2 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-lg font-bold text-shpc-ink">
                                <span>Total Paid (USD)</span>
                                <span>${booking.totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-muted-foreground text-sm">
                                <span>Processed via Website</span>
                            </div>
                        </div>

                        <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm start">
                            <div>
                                <p className="text-muted-foreground">Payment Processed On</p>
                                <p className="font-medium">{format(booking.createdAt, "MMM dd, yyyy")}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Transaction Ref</p>
                                <p className="font-medium">{booking.id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

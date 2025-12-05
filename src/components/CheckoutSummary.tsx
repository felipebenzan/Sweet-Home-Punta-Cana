import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookingDetails } from '@/lib/types';
import { format } from 'date-fns';
import { Calendar, Users, Plane, Moon } from 'lucide-react';

interface CheckoutSummaryProps {
    bookingDetails: BookingDetails;
    pickupPrice: number;
    tripType: 'none' | 'one-way' | 'round-trip';
    airline?: string;
    flightNumber?: string;
    arrivalDate?: Date;
    returnDate?: Date;
    returnFlightNumber?: string;
}

export default function CheckoutSummary({
    bookingDetails,
    pickupPrice,
    tripType,
    airline,
    flightNumber,
    arrivalDate,
    returnDate,
    returnFlightNumber,
}: CheckoutSummaryProps) {
    const { rooms, dates, guests, nights, totalPrice } = bookingDetails;
    const finalPrice = totalPrice + pickupPrice;

    return (
        <Card className="shadow-soft rounded-2xl w-full lg:w-96">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">💰</span> Booking Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Dates */}
                <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-shpc-ink mt-0.5" />
                    <div>
                        <p className="font-semibold text-shpc-ink">Dates</p>
                        <p className="text-sm text-neutral-600">
                            {format(new Date(dates.from), 'LLL dd, y')} - {format(new Date(dates.to), 'LLL dd, y')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {nights} {nights === 1 ? 'night' : 'nights'}
                        </p>
                    </div>
                </div>

                {/* Guests */}
                <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-shpc-ink mt-0.5" />
                    <div>
                        <p className="font-semibold text-shpc-ink">Guests</p>
                        <p className="text-sm text-neutral-600">
                            {guests} {guests === 1 ? 'Guest' : 'Guests'}
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Rooms */}
                <div className="space-y-3">
                    <p className="font-semibold text-shpc-ink">Rooms</p>
                    {rooms.map((room) => (
                        <div key={room.id} className="flex justify-between text-sm">
                            <span className="text-neutral-600">{room.name}</span>
                            <span className="font-medium">${(room.price * nights).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                {/* Airport Transfer */}
                {tripType !== 'none' && (
                    <>
                        <Separator />
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Plane className="h-4 w-4 text-shpc-ink" />
                                <p className="font-semibold text-shpc-ink">Airport Transfer</p>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">
                                    {tripType === 'one-way' ? 'One-way Pickup' : 'Round Trip'}
                                </span>
                                <span className="font-medium">${pickupPrice.toFixed(2)}</span>
                            </div>

                            <div className="text-xs text-muted-foreground space-y-1 pl-6">
                                {airline && flightNumber && (
                                    <p>Arr: {airline} {flightNumber} {arrivalDate && `on ${format(arrivalDate, 'MMM dd')}`}</p>
                                )}
                                {tripType === 'round-trip' && returnFlightNumber && (
                                    <p>Ret: {returnFlightNumber} {returnDate && `on ${format(returnDate, 'MMM dd')}`}</p>
                                )}
                            </div>
                        </div>
                    </>
                )}

                <Separator />

                {/* Total */}
                {/* Taxes & Fees */}
                <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Taxes & Fees</span>
                    <span className="font-medium">$0.00</span>
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-end">
                        <span className="font-bold text-xl text-shpc-ink">Total</span>
                        <span className="font-bold text-3xl text-shpc-ink">${finalPrice.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">USD</span></span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-shpc-ink font-medium">✨ All taxes included, no hidden fees.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

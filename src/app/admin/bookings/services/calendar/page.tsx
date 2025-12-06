'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plane, Shirt, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Booking {
    confirmationId: string;
    type: string;
    guestName?: string;
    customer?: { name?: string; email?: string; phone?: string };
    date?: string;
    createdAt?: string;
    details?: any;
    totalPrice?: number;
}

export default function ServiceBookingsCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const response = await fetch('/api/bookings');
            const data = await response.json();
            // Filter service bookings (transfer, laundry, excursion)
            setBookings(
                data.bookings?.filter((b: Booking) =>
                    ['transfer', 'laundry', 'excursion'].includes(b.type)
                ) || []
            );
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const formatDate = (year: number, month: number, day: number): string => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const getServiceDate = (booking: Booking): string => {
        // For transfers, use arrival or departure date
        if (booking.type === 'transfer' && booking.details) {
            return booking.details.arrivalDate || booking.details.departureDate || '';
        }

        // For laundry and excursions, use the date field or extract from createdAt
        if (booking.date) return booking.date;

        // Fallback to createdAt date
        if (booking.createdAt) {
            return new Date(booking.createdAt).toISOString().split('T')[0];
        }

        return '';
    };

    const getBookingsForDate = (dateStr: string): Booking[] => {
        return bookings.filter(booking => {
            const serviceDate = getServiceDate(booking);
            return serviceDate === dateStr;
        });
    };

    const getServiceIcon = (type: string) => {
        switch (type) {
            case 'transfer': return <Plane className="h-3 w-3" />;
            case 'laundry': return <Shirt className="h-3 w-3" />;
            case 'excursion': return <MapPin className="h-3 w-3" />;
            default: return null;
        }
    };

    const getServiceColor = (type: string) => {
        switch (type) {
            case 'transfer': return 'bg-green-500';
            case 'laundry': return 'bg-purple-500';
            case 'excursion': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    const getServiceBgColor = (type: string) => {
        switch (type) {
            case 'transfer': return 'bg-green-50 border-green-200';
            case 'laundry': return 'bg-purple-50 border-purple-200';
            case 'excursion': return 'bg-orange-50 border-orange-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
        setSelectedDate(null);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
        setSelectedDate(null);
    };

    const handleDayClick = (dateStr: string) => {
        setSelectedDate(selectedDate === dateStr ? null : dateStr);
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const renderCalendar = () => {
        const days = [];
        const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

        for (let i = 0; i < totalCells; i++) {
            const dayNumber = i - startingDayOfWeek + 1;
            const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
            const dateStr = isValidDay ? formatDate(year, month, dayNumber) : '';
            const dayBookings = isValidDay ? getBookingsForDate(dateStr) : [];
            const isSelected = dateStr === selectedDate;
            const isToday = isValidDay && dateStr === formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

            // Group by service type
            const transfers = dayBookings.filter(b => b.type === 'transfer');
            const laundry = dayBookings.filter(b => b.type === 'laundry');
            const excursions = dayBookings.filter(b => b.type === 'excursion');

            days.push(
                <div
                    key={i}
                    onClick={() => isValidDay && handleDayClick(dateStr)}
                    className={`
            min-h-[80px] p-2 border border-gray-200 
            ${isValidDay ? 'cursor-pointer hover:bg-gray-50' : 'bg-gray-100'}
            ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
            ${isToday ? 'bg-yellow-50' : ''}
          `}
                >
                    {isValidDay && (
                        <>
                            <div className="font-semibold text-sm mb-1">{dayNumber}</div>
                            <div className="flex gap-1 flex-wrap">
                                {transfers.length > 0 && (
                                    <div className="w-3 h-3 rounded-full bg-green-500" title={`${transfers.length} transfer(s)`} />
                                )}
                                {laundry.length > 0 && (
                                    <div className="w-3 h-3 rounded-full bg-purple-500" title={`${laundry.length} laundry`} />
                                )}
                                {excursions.length > 0 && (
                                    <div className="w-3 h-3 rounded-full bg-orange-500" title={`${excursions.length} excursion(s)`} />
                                )}
                            </div>
                        </>
                    )}
                </div>
            );
        }

        return days;
    };

    const renderBookingsList = () => {
        if (!selectedDate) return null;

        const dayBookings = getBookingsForDate(selectedDate);

        if (dayBookings.length === 0) {
            return (
                <Card className="mt-6">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No service bookings for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </CardContent>
                </Card>
            );
        }

        // Group by type
        const transfers = dayBookings.filter(b => b.type === 'transfer');
        const laundry = dayBookings.filter(b => b.type === 'laundry');
        const excursions = dayBookings.filter(b => b.type === 'excursion');

        return (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>
                        Service Bookings for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Transfers */}
                    {transfers.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-4 h-4 rounded-full bg-green-500" />
                                <Plane className="h-4 w-4" />
                                <h3 className="font-semibold">Airport Transfers ({transfers.length})</h3>
                            </div>
                            <div className="space-y-2">
                                {transfers.map(booking => (
                                    <Link href={`/admin/bookings/${booking.confirmationId}`} key={booking.confirmationId}>
                                        <div className={`p-3 rounded-lg border ${getServiceBgColor('transfer')} hover:shadow-md transition-shadow cursor-pointer`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{booking.guestName || booking.customer?.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {booking.details?.direction === 'arrive' ? '✈️ Arrival' : '🛫 Departure'}
                                                        {booking.details?.flightNumber && ` - Flight ${booking.details.flightNumber}`}
                                                        {booking.details?.arrivalFlight && ` - Flight ${booking.details.arrivalFlight}`}
                                                    </p>
                                                    {booking.customer?.phone && (
                                                        <p className="text-sm text-muted-foreground">📱 {booking.customer.phone}</p>
                                                    )}
                                                </div>
                                                <Badge variant="outline" className="bg-white">
                                                    ${booking.totalPrice}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Laundry */}
                    {laundry.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-4 h-4 rounded-full bg-purple-500" />
                                <Shirt className="h-4 w-4" />
                                <h3 className="font-semibold">Laundry Service ({laundry.length})</h3>
                            </div>
                            <div className="space-y-2">
                                {laundry.map(booking => (
                                    <Link href={`/admin/bookings/${booking.confirmationId}`} key={booking.confirmationId}>
                                        <div className={`p-3 rounded-lg border ${getServiceBgColor('laundry')} hover:shadow-md transition-shadow cursor-pointer`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{booking.guestName || booking.customer?.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {booking.details?.bags} bag(s) @ ${booking.details?.pricePerBag}/bag
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="bg-white">
                                                    ${booking.totalPrice}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Excursions */}
                    {excursions.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-4 h-4 rounded-full bg-orange-500" />
                                <MapPin className="h-4 w-4" />
                                <h3 className="font-semibold">Excursions ({excursions.length})</h3>
                            </div>
                            <div className="space-y-2">
                                {excursions.map(booking => (
                                    <Link href={`/admin/bookings/${booking.confirmationId}`} key={booking.confirmationId}>
                                        <div className={`p-3 rounded-lg border ${getServiceBgColor('excursion')} hover:shadow-md transition-shadow cursor-pointer`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{booking.guestName || booking.customer?.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {booking.details?.title || 'Excursion'}
                                                    </p>
                                                    {booking.details?.guests && (
                                                        <p className="text-sm text-muted-foreground">👥 {booking.details.guests} guest(s)</p>
                                                    )}
                                                </div>
                                                <Badge variant="outline" className="bg-white">
                                                    ${booking.totalPrice}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <p>Loading calendar...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 bg-shpc-sand min-h-full">
            <div className="mb-6">
                <Link href="/admin/bookings/services">
                    <Button variant="ghost" className="mb-4">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to List View
                    </Button>
                </Link>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Service Bookings Calendar</h1>
                </div>
            </div>

            {/* Calendar Navigation */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <Button onClick={previousMonth} variant="outline" size="sm">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-2xl font-bold">{monthName}</h2>
                        <Button onClick={nextMonth} variant="outline" size="sm">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Legend */}
                    <div className="flex gap-6 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <Plane className="h-3 w-3" />
                            <span>Transfer</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                            <Shirt className="h-3 w-3" />
                            <span>Laundry</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500" />
                            <MapPin className="h-3 w-3" />
                            <span>Excursion</span>
                        </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-0 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center font-semibold text-sm p-2 bg-gray-100">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-0 border border-gray-200">
                        {renderCalendar()}
                    </div>
                </CardContent>
            </Card>

            {/* Selected day bookings */}
            {renderBookingsList()}
        </div>
    );
}

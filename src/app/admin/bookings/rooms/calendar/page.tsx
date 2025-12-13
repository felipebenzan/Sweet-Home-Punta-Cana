'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Home, User, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';

interface Booking {
    confirmationId: string;
    type: string;
    guestName?: string;
    customer?: { name?: string; email?: string; phone?: string };
    dates?: { checkIn: string; checkOut: string };
    rooms?: Array<{ name: string; slug: string }>;
    guests?: number;
    totalPrice?: number;
}

interface DayStatus {
    checkIns: Booking[];
    stayOvers: Booking[];
    checkOuts: Booking[];
}

export default function RoomBookingsCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const response = await fetch('/api/bookings', { cache: 'no-store' });
            const data = await response.json();
            setBookings(data.bookings?.filter((b: Booking) => b.type === 'room') || []);
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

    const getBookingsForDate = (dateStr: string): DayStatus => {
        const checkIns: Booking[] = [];
        const stayOvers: Booking[] = [];
        const checkOuts: Booking[] = [];

        bookings.forEach(booking => {
            if (!booking.dates) return;

            const checkIn = booking.dates.checkIn;
            const checkOut = booking.dates.checkOut;

            if (dateStr === checkIn) {
                checkIns.push(booking);
            } else if (dateStr === checkOut) {
                checkOuts.push(booking);
            } else if (dateStr > checkIn && dateStr < checkOut) {
                stayOvers.push(booking);
            }
        });

        return { checkIns, stayOvers, checkOuts };
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
            const dayStatus = isValidDay ? getBookingsForDate(dateStr) : null;
            const isSelected = dateStr === selectedDate;
            const isToday = isValidDay && dateStr === formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

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
                            {dayStatus && (
                                <div className="flex gap-1 flex-wrap">
                                    {dayStatus.checkIns.length > 0 && (
                                        <div className="w-3 h-3 rounded-full bg-green-500" title="Check-in" />
                                    )}
                                    {dayStatus.stayOvers.length > 0 && (
                                        <div className="w-3 h-3 rounded-full bg-blue-500" title="Stay-over" />
                                    )}
                                    {dayStatus.checkOuts.length > 0 && (
                                        <div className="w-3 h-3 rounded-full bg-red-500" title="Check-out" />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            );
        }

        return days;
    };

    const renderBookingsList = () => {
        if (!selectedDate) return null;

        const dayStatus = getBookingsForDate(selectedDate);
        const [y, m, d] = selectedDate.split('-').map(Number);
        const displayDate = new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const hasBookings = dayStatus.checkIns.length > 0 || dayStatus.stayOvers.length > 0 || dayStatus.checkOuts.length > 0;

        if (!hasBookings) {
            return (
                <Card className="mt-6">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No bookings for {displayDate}
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>
                        Bookings for {displayDate}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Check-ins */}
                    {dayStatus.checkIns.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-4 h-4 rounded-full bg-green-500" />
                                <h3 className="font-semibold">Check-ins ({dayStatus.checkIns.length})</h3>
                            </div>
                            <div className="space-y-2">
                                {dayStatus.checkIns.map(booking => (
                                    <div key={booking.confirmationId} className="p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{booking.guestName || booking.customer?.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.rooms?.map(r => r.name).join(', ')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.dates?.checkIn} → {booking.dates?.checkOut}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="bg-white">
                                                {booking.confirmationId}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stay-overs */}
                    {dayStatus.stayOvers.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-4 h-4 rounded-full bg-blue-500" />
                                <h3 className="font-semibold">Staying ({dayStatus.stayOvers.length})</h3>
                            </div>
                            <div className="space-y-2">
                                {dayStatus.stayOvers.map(booking => (
                                    <div key={booking.confirmationId} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{booking.guestName || booking.customer?.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.rooms?.map(r => r.name).join(', ')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.dates?.checkIn} → {booking.dates?.checkOut}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="bg-white">
                                                {booking.confirmationId}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Check-outs */}
                    {dayStatus.checkOuts.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-4 h-4 rounded-full bg-red-500" />
                                <h3 className="font-semibold">Check-outs ({dayStatus.checkOuts.length})</h3>
                            </div>
                            <div className="space-y-2">
                                {dayStatus.checkOuts.map(booking => (
                                    <div key={booking.confirmationId} className="p-3 bg-red-50 rounded-lg border border-red-200">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{booking.guestName || booking.customer?.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.rooms?.map(r => r.name).join(', ')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.dates?.checkIn} → {booking.dates?.checkOut}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="bg-white">
                                                {booking.confirmationId}
                                            </Badge>
                                        </div>
                                    </div>
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
                <Link href="/admin/bookings/rooms">
                    <Button variant="ghost" className="mb-4">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to List View
                    </Button>
                </Link>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Room Bookings Calendar</h1>
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
                            <span>Check-in</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span>Staying</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span>Check-out</span>
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

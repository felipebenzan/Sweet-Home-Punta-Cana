
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, type Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, ConciergeBell, Calendar as CalendarIcon, Shirt, Plane, Sailboat, Loader2 } from 'lucide-react';
import type { ServiceBooking } from '@/lib/types';
import { format, parse, parseISO } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Day, type DayProps } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';

type BookingsByDate = Record<string, ServiceBooking[]>;
type ServicesByDate = Record<string, Set<'laundry' | 'airportTransfer' | 'excursion' | 'other'>>;

const serviceTypeColors: Record<string, string> = {
  laundry: 'bg-yellow-400',
  airportTransfer: 'bg-green-400',
  excursion: 'bg-red-400',
  other: 'bg-gray-400',
};

const getServiceTypeKey = (booking: ServiceBooking): 'laundry' | 'airportTransfer' | 'excursion' | 'other' => {
  const serviceTypeLower = (booking.serviceType || booking.type || '').toLowerCase();
  if (serviceTypeLower.includes('laundry')) return 'laundry';
  if (serviceTypeLower.includes('transfer')) return 'airportTransfer';
  if (serviceTypeLower.startsWith('excursion')) return 'excursion';
  return 'other';
};

const PAGE_SIZE = 20;

export default function ServiceBookingsClient() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const enabled = !!db && !!user;

  const bookingsQuery = useMemoFirebase(() => {
    if (!enabled) return null;
    return query(collection(db as Firestore, 'serviceBookings'), orderBy('createdAt', 'desc'));
  }, [enabled, db]);
  
  const { data: bookings, isLoading, error } = useCollection<ServiceBooking>(bookingsQuery);

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

   React.useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching bookings",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const sortedBookings = React.useMemo(() => {
    if (!bookings) return [];
    return [...bookings].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });
  }, [bookings]);

  const { bookingsByDate, servicesByDate } = React.useMemo(() => {
    const bbd: BookingsByDate = {};
    const sbd: ServicesByDate = {};

    for (const booking of sortedBookings) {
      const primaryDateStr = booking.details?.date || booking.details?.arrivalDate || booking.details?.departureDate;
      if (primaryDateStr) {
        try {
          const dateKey = format(parseISO(primaryDateStr), 'yyyy-MM-dd');
          if (!bbd[dateKey]) bbd[dateKey] = [];
          if (!sbd[dateKey]) sbd[dateKey] = new Set();
          
          bbd[dateKey].push(booking);
          sbd[dateKey].add(getServiceTypeKey(booking));
        } catch(e) {
          console.error(`Could not parse date for service booking ${booking.id}:`, primaryDateStr, e);
        }
      }
    }
    return { bookingsByDate: bbd, servicesByDate: sbd };
  }, [sortedBookings]);

  const selectedDayBookings = React.useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const dayBookings = bookingsByDate[dateKey] || [];
    return dayBookings.sort((a, b) => {
        const timeA = a.details?.time || a.details?.departureTime;
        const timeB = b.details?.time || b.details?.departureTime;
        if (timeA && timeB) {
            try {
                return parse(timeA, 'HH:mm', new Date()).getTime() - parse(timeB, 'HH:mm', new Date()).getTime();
            } catch {
                return 0;
            }
        }
        return 0;
    });
  }, [selectedDate, bookingsByDate]);
  
  const formatDisplayDate = (booking: ServiceBooking) => {
    const primaryDateStr = booking.details?.date || booking.details?.departureDate || booking.details?.arrivalDate;
    if (!primaryDateStr) return 'No date set';
    try {
      const primaryDate = parseISO(primaryDateStr);
      let timeStr = booking.details?.time || booking.details?.departureTime;
      
      let datePart = format(primaryDate, 'MMM dd, yyyy');
      let timePart = '';

      if (timeStr) {
         try {
             timePart = ' at ' + format(parse(timeStr, 'HH:mm', new Date()), 'h:mm a');
         } catch { /* timeStr might be invalid */ }
      }
       return `${datePart}${timePart}`;
    } catch (error) {
      return 'Invalid Date';
    }
  }

  const getServiceIcon = (booking: ServiceBooking) => {
    const serviceTypeKey = getServiceTypeKey(booking);
    if (serviceTypeKey === 'laundry') return <Shirt className="h-4 w-4 text-muted-foreground"/>;
    if (serviceTypeKey === 'airportTransfer') return <Plane className="h-4 w-4 text-muted-foreground"/>;
    if (serviceTypeKey === 'excursion') return <Sailboat className="h-4 w-4 text-muted-foreground"/>;
    return <ConciergeBell className="h-4 w-4 text-muted-foreground"/>
  }
  
  function DayWithDots(props: DayProps) {
    const dateKey = format(props.date, 'yyyy-MM-dd');
    const services = servicesByDate[dateKey];
    return (
      <div className="relative flex flex-col items-center justify-center h-full">
        <Day {...props} />
        {services && (
          <div className="absolute bottom-1 flex gap-0.5">
            {Array.from(services).map(serviceType => (
              <div key={serviceType} className={cn('h-1.5 w-1.5 rounded-full', serviceTypeColors[serviceType])} />
            ))}
          </div>
        )}
      </div>
    )
  }
  
  const displayedBookings = sortedBookings.slice(0, visibleCount);

  return (
    <div className="p-4 sm:p-6 bg-shpc-sand min-h-full">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-shpc-ink">Guest Services</h1>
          <p className="text-muted-foreground">Manage services like transfers, laundry, and excursions.</p>
        </div>
      </header>
      
      <Tabs defaultValue="list">
        <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>
            <div className="flex gap-1.5 text-xs text-muted-foreground items-center">
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-yellow-400"/>Laundry</span>
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-green-400"/>Transfer</span>
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-red-400"/>Excursion</span>
            </div>
        </div>

        <TabsContent value="list" className="mt-6">
          <Card className="shadow-soft rounded-2xl">
            <CardHeader>
              <CardTitle>All Service Bookings</CardTitle>
              <CardDescription>
                This list shows all requested guest services, sorted by most recent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date / Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No service bookings found yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedBookings.map(booking => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {booking.customer?.name}
                          </TableCell>
                          <TableCell>
                              <div className="flex items-center gap-2">
                                  {getServiceIcon(booking)}
                                  {booking.type}
                              </div>
                          </TableCell>
                          <TableCell>
                              <div className="flex items-center gap-2">
                                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                  {formatDisplayDate(booking)}
                              </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/guest-services/${booking.id}`}>
                                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
             {sortedBookings.length > visibleCount && (
                <CardFooter className="py-4">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                  >
                    Load More Bookings
                  </Button>
                </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-soft rounded-2xl p-2">
                {isLoading ? (
                    <Skeleton className="w-full h-96" />
                ) : (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="w-full"
                    components={{ Day: DayWithDots }}
                  />
                )}
              </Card>
              <div className="lg:col-span-1">
                <Card className="shadow-soft rounded-2xl">
                  <CardHeader>
                    <CardTitle>
                      {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'No date selected'}
                    </CardTitle>
                    <CardDescription>Services for this day.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                         <Skeleton className="w-full h-40" />
                    ) : selectedDayBookings.length > 0 ? (
                      <ul className="space-y-3">
                        {selectedDayBookings.map(booking => (
                          <li key={booking.id}>
                            <Link href={`/admin/guest-services/${booking.id}`} className="block p-3 rounded-lg hover:bg-muted/50">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 font-medium">
                                      {getServiceIcon(booking)}
                                      {booking.type}
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 pl-6 flex justify-between">
                                  <span>{booking.customer.name}</span>
                                  {(booking.details?.time || (booking.type === 'airportTransfer' && booking.details?.departureTime)) && (
                                    <span className="font-medium text-foreground">
                                        {format(parse(booking.details.time || booking.details.departureTime!, 'HH:mm', new Date()), 'h:mm a')}
                                    </span>
                                  )}
                                </p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center text-sm text-muted-foreground py-10">
                        No services scheduled for this day.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import * as React from "react";
import { getReservations } from "@/server-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Bed,
  Calendar as CalendarIcon,
  User,
  ArrowRight,
  Home,
} from "lucide-react";
import {
  format,
  parseISO,
  isSameDay,
  startOfDay,
  eachDayOfInterval,
} from "date-fns";
import type { Reservation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Day, type DayProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type BookingEventType = "check-in" | "stay-over" | "check-out";

interface BookingEvent {
  type: BookingEventType;
  reservation: Reservation;
}

type BookingsByDate = Record<string, BookingEvent[]>;
type EventsByDate = Record<string, Set<BookingEventType>>;

const eventTypeColors: Record<BookingEventType, string> = {
  "check-in": "bg-green-500",
  "stay-over": "bg-blue-500",
  "check-out": "bg-red-500",
};

const eventTypeLabels: Record<BookingEventType, string> = {
  "check-in": "Check-ins",
  "stay-over": "Stay-overs",
  "check-out": "Check-outs",
};

export default function BookingsPage() {
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date()
  );
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  React.useEffect(() => {
    async function fetchReservations() {
      try {
        const resData = await getReservations();
        console.log("Fetched Reservations:", resData);
        setReservations(resData);
      } catch (error) {
        console.error("Failed to fetch reservations:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReservations();
  }, []);

  const { bookingsByDate, eventsByDate } = React.useMemo(() => {
    const bbd: BookingsByDate = {};
    const ebd: EventsByDate = {};

    for (const res of reservations) {
      try {
        const checkInDate = startOfDay(parseISO(res.checkInDate));
        const checkOutDate = startOfDay(parseISO(res.checkOutDate));

        const interval = eachDayOfInterval({
          start: checkInDate,
          end: checkOutDate,
        });

        interval.forEach((day, index) => {
          const dateKey = format(day, "yyyy-MM-dd");
          if (!bbd[dateKey]) bbd[dateKey] = [];
          if (!ebd[dateKey]) ebd[dateKey] = new Set();

          let eventType: BookingEventType;
          if (isSameDay(day, checkInDate)) {
            eventType = "check-in";
          } else if (isSameDay(day, checkOutDate)) {
            eventType = "check-out";
          } else {
            eventType = "stay-over";
          }

          bbd[dateKey].push({ type: eventType, reservation: res });
          ebd[dateKey].add(eventType);
        });
      } catch (e) {
        console.error(`Could not parse dates for reservation ${res.id}`, e);
      }
    }
    return { bookingsByDate: bbd, eventsByDate: ebd };
  }, [reservations]);

  const selectedDayEvents = React.useMemo(() => {
    if (!selectedDate) return null;
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const events = bookingsByDate[dateKey] || [];

    // Group events by type
    return events.reduce((acc, event) => {
      if (!acc[event.type]) {
        acc[event.type] = [];
      }
      acc[event.type].push(event.reservation);
      return acc;
    }, {} as Record<BookingEventType, Reservation[]>);
  }, [selectedDate, bookingsByDate]);

  function DayWithDots(props: DayProps) {
    const dateKey = format(props.date, "yyyy-MM-dd");
    const events = eventsByDate[dateKey];
    return (
      <div className="relative flex flex-col items-center justify-center h-full">
        <Day {...props} />
        {events && (
          <div className="absolute bottom-1 flex gap-0.5">
            {Array.from(events)
              .sort()
              .map((eventType) => (
                <div
                  key={eventType}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    eventTypeColors[eventType]
                  )}
                />
              ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-shpc-sand min-h-full">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-shpc-ink">Bookings</h1>
          <p className="text-muted-foreground">
            A live list of all guest room reservations.
          </p>
        </div>
      </header>

      <Tabs defaultValue="list">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
          <div className="flex gap-2 text-xs text-muted-foreground items-center">
            <span className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Check-in
            </span>
            <span className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Stay-over
            </span>
            <span className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              Check-out
            </span>
          </div>
        </div>

        <TabsContent value="list" className="mt-6">
          <Card className="shadow-soft rounded-2xl">
            <CardHeader>
              <CardTitle>All Reservations</CardTitle>
              <CardDescription>
                This list is updated in real-time.
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
                      <TableHead>Dates</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Room
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No reservations found yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      reservations.map((res) => (
                        <TableRow key={res.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {res.guestName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(
                                  new Date(res.checkInDate),
                                  "MMM dd, yyyy"
                                )}{" "}
                                -{" "}
                                {format(
                                  new Date(res.checkOutDate),
                                  "MMM dd, yyyy"
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <Bed className="h-4 w-4 text-muted-foreground" />
                              {res.roomName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                res.status.toLowerCase() === "confirmed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {res.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/bookings/${res.id}`}>
                                View <ArrowRight className="ml-2 h-4 w-4" />
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
                    {selectedDate
                      ? format(selectedDate, "MMMM dd, yyyy")
                      : "No date selected"}
                  </CardTitle>
                  <CardDescription>Bookings for this day.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="w-full h-40" />
                  ) : selectedDayEvents &&
                    Object.keys(selectedDayEvents).length > 0 ? (
                    <div className="space-y-4">
                      {(
                        [
                          "check-in",
                          "stay-over",
                          "check-out",
                        ] as BookingEventType[]
                      ).map(
                        (eventType) =>
                          selectedDayEvents[eventType] && (
                            <div key={eventType}>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <div
                                  className={cn(
                                    "h-2.5 w-2.5 rounded-full",
                                    eventTypeColors[eventType]
                                  )}
                                />
                                {eventTypeLabels[eventType]}
                              </h4>
                              <ul className="space-y-2">
                                {selectedDayEvents[eventType].map((res) => (
                                  <li key={res.id}>
                                    <Link
                                      href={`/admin/bookings/${res.id}`}
                                      className="block text-sm p-2 rounded-lg hover:bg-muted/50"
                                    >
                                      <p className="font-medium flex justify-between items-center">
                                        {res.guestName}
                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                      </p>
                                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Home className="h-3 w-3" />
                                        {res.roomName}
                                      </p>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-sm text-muted-foreground py-10">
                      No booking activity for this day.
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

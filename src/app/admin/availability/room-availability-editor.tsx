"use client";

import * as React from "react";
import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
  parseISO,
  subMonths,
} from "date-fns";
import { ChevronLeft, Minus, Plus, Loader2, Bed } from "lucide-react";
import type { Room, Reservation } from "@/lib/types";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  writeBatch,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import {
  useFirestore,
  useMemoFirebase,
  useCollection,
  errorEmitter,
  FirestorePermissionError,
} from "@/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
  getRoomBySlug,
  getReservationsByRoomId,
} from "@/app/server-actions.readonly";
import { Skeleton } from "@/components/ui/skeleton";

interface RoomAvailabilityEditorProps {
  slug: string;
}

// Data structure for a single day on the calendar
type DayData = {
  date: string;
  isClosed: boolean; // Manually closed by admin
  manualInventory: number; // Inventory set by admin for this day
  bookedCount: number; // Number of confirmed reservations
  price: number; // Nightly price
};

// The main calendar data structure
type CalendarData = Record<string, DayData>;

export default function RoomAvailabilityEditor({
  slug,
}: RoomAvailabilityEditorProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [room, setRoom] = React.useState<Room | null>(null);
  const [allReservations, setAllReservations] = React.useState<Reservation[]>(
    []
  );
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const [selectedDates, setSelectedDates] = React.useState<Date[]>([]);
  const [draftData, setDraftData] = React.useState<{
    closed: boolean;
    available: number;
    price: number;
  } | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = React.useState(true);
  const [isLoadingReservations, setIsLoadingReservations] =
    React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  // 1. Fetch Room Data and Reservations (once)
  React.useEffect(() => {
    async function fetchRoomAndReservations() {
      if (!slug) return;
      setIsLoadingRoom(true);
      setIsLoadingReservations(true);
      try {
        const roomData = await getRoomBySlug(slug);
        if (!roomData) {
          toast({
            title: "Error",
            description: "Room not found.",
            variant: "destructive",
          });
          return;
        }
        setRoom(roomData);

        const reservationsData = await getReservationsByRoomId(roomData.id);
        setAllReservations(reservationsData);
      } catch (error) {
        console.error("Failed to fetch room or reservations:", error);
        toast({
          title: "Error",
          description: "Could not load room data.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingRoom(false);
        setIsLoadingReservations(false);
      }
    }
    fetchRoomAndReservations();
  }, [slug, toast]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // 2. Fetch Real-time Rates
  const ratesQuery = useMemoFirebase(() => {
    if (!db || !room?.id) return null;
    return query(
      collection(db, `rates/${room.id}/calendar`),
      where("date", ">=", format(monthStart, "yyyy-MM-dd")),
      where("date", "<=", format(monthEnd, "yyyy-MM-dd"))
    );
  }, [db, room?.id, currentMonth]);

  const { data: rates, isLoading: isLoadingRates } = useCollection(ratesQuery);

  // 3. Process all data into a unified calendar view
  const calendarData = React.useMemo(() => {
    const newCalendarData: CalendarData = {};
    if (!room) return newCalendarData;

    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    daysInMonth.forEach((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      newCalendarData[dateKey] = {
        date: dateKey,
        isClosed: false,
        manualInventory: room.inventoryUnits ?? 1,
        bookedCount: 0,
        price: room.price ?? 0,
      };
    });

    rates?.forEach((rate) => {
      const dateKey = rate.date;
      if (newCalendarData[dateKey]) {
        newCalendarData[dateKey].isClosed = rate.closed || false;
        newCalendarData[dateKey].manualInventory = rate.available;
        newCalendarData[dateKey].price = rate.price;
      }
    });

    allReservations?.forEach((res) => {
      try {
        const checkIn = parseISO(res.checkInDate);
        const checkOut = parseISO(res.checkOutDate);

        const bookingInterval = eachDayOfInterval({
          start: checkIn,
          end: checkOut,
        });

        bookingInterval.forEach((day) => {
          if (day < checkOut) {
            const dateKey = format(day, "yyyy-MM-dd");
            if (newCalendarData[dateKey]) {
              newCalendarData[dateKey].bookedCount += 1;
            }
          }
        });
      } catch (e) {
        console.error(`Could not parse reservation dates for ${res.id}`, e);
      }
    });

    return newCalendarData;
  }, [room, rates, allReservations, currentMonth]);

  // Effect to update the draft panel when dates are selected
  React.useEffect(() => {
    if (selectedDates.length > 0 && room) {
      const firstDateKey = format(selectedDates[0], "yyyy-MM-dd");
      const dayData = calendarData[firstDateKey];

      setDraftData({
        closed: dayData?.isClosed || false,
        available: dayData?.manualInventory ?? room.inventoryUnits ?? 1,
        price: dayData?.price ?? room.price ?? 0,
      });
    } else {
      setDraftData(null);
    }
  }, [selectedDates, calendarData, room]);

  const handleSave = async () => {
    if (!draftData || !room || !db || selectedDates.length === 0) {
      toast({
        title: "Save Aborted",
        description: "Missing required data to save.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const batch = writeBatch(db);

    for (const date of selectedDates) {
      const dateKey = format(date, "yyyy-MM-dd");
      const rateDocRef = doc(db, `rates/${room.id}/calendar/${dateKey}`);

      const rateData = {
        roomId: room.id,
        slug: room.slug,
        date: dateKey,
        price: draftData.price,
        available: draftData.available,
        closed: draftData.closed,
        source: "manual",
        updatedAt: Timestamp.now(),
      };

      batch.set(rateDocRef, rateData, { merge: true });
    }

    try {
      await batch.commit();
      toast({
        title: "Success",
        description: "Availability updated successfully.",
      });
      setSelectedDates([]);
    } catch (error: any) {
      const permissionError = new FirestorePermissionError({
        path: `rates/${room.id}/calendar`,
        operation: "write",
        requestResourceData: {
          closed: draftData.closed,
          available: draftData.available,
          price: draftData.price,
        },
      });
      errorEmitter.emit("permission-error", permissionError);
      setSaveError(permissionError.message); // Set the detailed error message
      toast({
        title: "Save Failed",
        description: "Check diagnostics for details.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // UI Handlers for the draft panel
  const handleDraftChange = (
    updater: (draft: typeof draftData) => Partial<typeof draftData>
  ) => {
    if (!draftData) return;
    const newDraft = { ...draftData, ...updater(draftData) };
    setDraftData(newDraft);
  };

  const handleBookingStatusChange = (status: "open" | "closed") => {
    handleDraftChange(() => ({ closed: status === "closed" }));
  };

  const handleAvailabilityChange = (amount: number) => {
    handleDraftChange((currentStatus) => ({
      available: Math.max(0, (currentStatus?.available ?? 0) + amount),
    }));
  };

  const isLoading = isLoadingRoom || isLoadingRates || isLoadingReservations;
  const firstDayOfMonth = startOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: endOfMonth(currentMonth),
  });

  const getDayStatus = (day: Date) => {
    const dayKey = format(day, "yyyy-MM-dd");
    const dayData = calendarData[dayKey];

    if (!dayData)
      return { text: "Loading...", color: "bg-gray-100", netAvailable: 0 };

    const { isClosed, manualInventory, bookedCount } = dayData;
    const netAvailable = manualInventory - bookedCount;

    if (isClosed)
      return { text: "Closed", color: "bg-red-200 text-red-800", netAvailable };
    if (netAvailable <= 0)
      return {
        text: "Sold Out",
        color: "bg-yellow-200 text-yellow-800",
        netAvailable,
      };
    if (bookedCount > 0)
      return {
        text: `${bookedCount} Booked`,
        color: "bg-yellow-100 text-yellow-700",
        netAvailable,
      };
    return {
      text: "Available",
      color: "bg-green-200 text-green-800",
      netAvailable,
    };
  };

  const handleDateClick = (day: Date) => {
    const isSelected = selectedDates.some((d) => isSameDay(d, day));
    if (isSelected) {
      setSelectedDates(selectedDates.filter((d) => !isSameDay(d, day)));
    } else {
      setSelectedDates([...selectedDates, day]);
    }
  };

  const firstSelectedDateKey =
    selectedDates.length > 0 ? format(selectedDates[0], "yyyy-MM-dd") : null;
  const firstDayData = firstSelectedDateKey
    ? calendarData[firstSelectedDateKey]
    : null;

  return (
    <div className="p-4 sm:p-6 bg-shpc-sand min-h-screen">
      <header className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost" size="icon" disabled={!room}>
          <Link href="/admin/availability">
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="text-center">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-48 mx-auto" />
              <Skeleton className="h-7 w-32 mx-auto mt-1" />
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Sweet Home Punta Cana Guest House
              </p>
              <h1 className="text-xl font-bold text-shpc-ink flex items-center gap-2 justify-center">
                <Bed className="h-5 w-5" />
                {room?.name}
              </h1>
            </>
          )}
        </div>
        <div className="w-10"></div>
      </header>

      <div className="flex items-center justify-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-center w-40">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-5 w-5 rotate-180" />
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : (
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="grid grid-cols-7 text-center text-sm font-semibold text-muted-foreground p-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
              <div key={`${day}-${i}`}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-t">
            {Array.from({ length: firstDayOfMonth.getDay() }).map((_, i) => (
              <div
                key={`empty-start-${i}`}
                className="h-20 border-l border-b"
              />
            ))}
            {daysInMonth.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const isSelected = selectedDates.some((d) => isSameDay(d, day));
              const { text, color, netAvailable } = getDayStatus(day);

              return (
                <button
                  key={dateKey}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "h-20 flex flex-col items-center justify-center transition-colors focus:outline-none border-l border-b p-1 text-center",
                    color,
                    isSelected && "ring-2 ring-primary ring-offset-1 z-10"
                  )}
                >
                  <span className="font-semibold text-lg">
                    {format(day, "d")}
                  </span>
                  <span className="text-xs font-medium">{text}</span>
                  <span className="text-xs">{netAvailable} left</span>
                </button>
              );
            })}
            {Array.from({
              length: (7 - (endOfMonth(currentMonth).getDay() + 1)) % 7,
            }).map((_, i) => (
              <div key={`empty-end-${i}`} className="h-20 border-l border-b" />
            ))}
          </div>
        </div>
      )}

      {selectedDates.length > 0 && draftData && (
        <div className="mt-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">{room?.name}</h2>
            <span className="text-sm text-muted-foreground">
              Editing {selectedDates.length}{" "}
              {selectedDates.length === 1 ? "date" : "dates"}
            </span>
          </div>

          <Card className="shadow-soft rounded-2xl">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Booking Status</Label>
                <RadioGroup
                  value={draftData.closed ? "closed" : "open"}
                  onValueChange={(value) =>
                    handleBookingStatusChange(value as "open" | "closed")
                  }
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="open" id="open" />
                    <Label htmlFor="open">Open</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="closed" id="closed" />
                    <Label htmlFor="closed">Close</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between">
                <Label>Total Inventory</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleAvailabilityChange(-1)}
                    disabled={draftData.closed}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-bold text-lg w-8 text-center">
                    {draftData.available}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleAvailabilityChange(1)}
                    disabled={draftData.closed}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Nightly Price</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={draftData.price}
                    onChange={(e) =>
                      handleDraftChange(() => ({
                        price: Number(e.target.value),
                      }))
                    }
                    className="w-24 font-bold text-lg text-right"
                    disabled={draftData.closed}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">Booked</Label>
                <span className="font-bold">
                  {firstDayData?.bookedCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between font-semibold">
                <Label>Net Available</Label>
                <span>
                  {Math.max(
                    0,
                    draftData.available - (firstDayData?.bookedCount || 0)
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedDates([])}
              className="w-full"
            >
              Clear
            </Button>
            <Button
              onClick={handleSave}
              className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 w-full"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving
                ? "Saving..."
                : `Save for ${selectedDates.length} Day(s)`}
            </Button>
          </div>

          {saveError && (
            <Card className="shadow-soft rounded-2xl bg-destructive/10 border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error Saving</CardTitle>
                <CardDescription className="text-destructive/80">
                  The database rejected the save operation. Here's the error:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-background p-2 rounded-md overflow-x-auto">
                  <code>{saveError}</code>
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

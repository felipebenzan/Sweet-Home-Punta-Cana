"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, differenceInDays, parseISO } from "date-fns";
import { getRooms, checkRoomAvailability } from "@/server-actions";
import type { Room } from "@/lib/types";
import RoomCard from "@/components/room-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DateSearch from "@/components/date-search";
import { ArrowRight, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useHeaderState } from "@/components/header-manager";

function SearchResults() {
  const isHeaderHidden = useHeaderState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const guests = Number(searchParams.get("guests") || "1");
  const requestedRoomSlug = searchParams.get("room");

  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);

  useEffect(() => {
    async function fetchAndFilterRooms() {
      if (!from || !to) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      try {
        console.log('try block start')
        const [roomsData, availableRoomIds] = await Promise.all([
          getRooms(),
          checkRoomAvailability({ from, to }),
        ]);
        console.log('room data',roomsData)
        console.log('room availability',availableRoomIds)
        
        const filteredRooms = roomsData.filter((room) =>
          availableRoomIds.includes(room.id)
        );

        setAllRooms(roomsData);
        setAvailableRooms(filteredRooms);

        // Handle pre-selection
        if (requestedRoomSlug) {
          const room = filteredRooms.find((r) => r.slug === requestedRoomSlug);
          if (room) {
            setSelectedRooms([room]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch or filter rooms:", error);
        toast({
          title: "Error",
          description: "Could not load room availability. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchAndFilterRooms();
  }, [from, to, requestedRoomSlug, toast]);

  const minRoomsRequired = Math.ceil(guests / 2);

  const handleSelectRoom = (room: Room) => {
    setSelectedRooms((prev) => {
      const isSelected = prev.some((r) => r.id === room.id);
      if (isSelected) {
        return prev.filter((r) => r.id !== room.id);
      }

      const maxRooms =
        guests === 1 ? 1 : guests === 2 ? 2 : guests === 3 ? 3 : 4;
      if (prev.length >= maxRooms) {
        toast({
          title: "Maximum rooms selected",
          description: `You can select a maximum of ${maxRooms} rooms for ${guests} guests.`,
        });
        return prev;
      }

      return [...prev, room];
    });
  };

  const isSelectionRequirementMet = selectedRooms.length >= minRoomsRequired;

  const handleContinueToCheckout = () => {
    if (!from || !to || !isSelectionRequirementMet) return;

    const nights = differenceInDays(parseISO(to), parseISO(from));
    const bookingDetails = {
      rooms: selectedRooms.map((r) => ({
        id: r.id,
        name: r.name,
        bedding: r.bedding,
        price: r.price,
        image: r.image,
        capacity: r.capacity,
        slug: r.slug,
      })),
      dates: { from, to },
      guests: Number(guests),
      nights,
      totalPrice: selectedRooms.reduce(
        (acc, room) => acc + room.price * nights,
        0
      ),
    };
    localStorage.setItem("bookingDetails", JSON.stringify(bookingDetails));
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="p-4 rounded-2xl shadow-soft bg-background/80 backdrop-blur-sm border border-shpc-edge mb-8">
          <Skeleton className="h-14 w-full" />
        </div>
        <Skeleton className="h-10 w-3/4 mb-2" />
        <Skeleton className="h-8 w-1/2 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!from || !to) {
    return (
      <div className="text-center py-16">
        <p>Please select a date range to search for rooms.</p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const fromDate = parseISO(from);
  const toDate = parseISO(to);
  const nights = differenceInDays(toDate, fromDate);

  const maxRooms = guests === 1 ? 1 : guests === 2 ? 2 : guests === 3 ? 3 : 4;
  const isMaxRoomsSelected = selectedRooms.length >= maxRooms;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div
        className={cn(
          "sticky z-40 transition-all duration-300 ease-in-out mb-8 -mt-6",
          isHeaderHidden ? "top-0" : "top-[var(--header-height)]"
        )}
      >
        <div className="p-4 rounded-2xl shadow-soft bg-background/80 backdrop-blur-sm border border-shpc-edge">
          <DateSearch />
        </div>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-shpc-ink mb-2">
          Select Your Accommodation
        </h1>
        <div className="mt-4 inline-block bg-primary/10 text-primary-foreground p-3 rounded-lg">
          <p className="text-base font-semibold text-shpc-ink">
            For {format(fromDate, "LLL dd, yyyy")} to{" "}
            {format(toDate, "LLL dd, yyyy")} ({nights}{" "}
            {nights === 1 ? "night" : "nights"})
          </p>
        </div>
      </div>

      {minRoomsRequired > 1 && (
        <div className="mb-8 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-3">
          <Info className="h-5 w-5" />
          <p className="font-medium text-sm">
            For {guests} guests, you need to select at least {minRoomsRequired}{" "}
            rooms.
          </p>
        </div>
      )}

      <div className="mb-8 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-3">
        <Info className="h-5 w-5" />
        <p className="font-medium text-sm">
          Traveling together but want separate rooms? Simply select more than
          one room.
        </p>
      </div>

      {availableRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {availableRooms.map((room) => {
            const isThisRoomSelected = selectedRooms.some(
              (r) => r.id === room.id
            );
            const isDisabled = isMaxRoomsSelected && !isThisRoomSelected;
            return (
              <RoomCard
                key={room.id}
                room={room}
                onSelect={() => handleSelectRoom(room)}
                isSelected={isThisRoomSelected}
                isSelectionMode={true}
                isDisabled={isDisabled}
                nights={nights}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl">
          <h2 className="text-2xl font-semibold text-shpc-ink">
            No Rooms Available
          </h2>
          <p className="mt-2 text-neutral-600">
            Sorry, no rooms match your criteria for the selected dates. Try
            adjusting your search.
          </p>
          <Button
            onClick={() => router.push("/")}
            variant="link"
            className="mt-4"
          >
            Change dates
          </Button>
        </div>
      )}

      {selectedRooms.length > 0 && (
        <div className="sticky bottom-6 mt-12 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border w-full max-w-lg mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">
                {selectedRooms.length}{" "}
                {selectedRooms.length === 1 ? "room" : "rooms"} selected
              </p>
              <p className="text-sm text-muted-foreground">
                Total: $
                {selectedRooms
                  .reduce((acc, room) => acc + room.price * nights, 0)
                  .toFixed(2)}
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleContinueToCheckout}
              disabled={!isSelectionRequirementMet}
            >
              Next → Review & Pay
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          {!isSelectionRequirementMet && (
            <p className="text-xs text-destructive text-center pt-2">
              Please select at least {minRoomsRequired}{" "}
              {minRoomsRequired === 1 ? "room" : "rooms"} to continue.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading search results...
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}

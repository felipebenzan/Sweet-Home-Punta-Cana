"use client";

import * as React from "react";
import Link from "next/link";
import { getRooms } from "@/app/server-actions.readonly";
import type { Room } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bed } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AvailabilityDashboardPage() {
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRooms() {
      try {
        const roomsData = await getRooms();
        setRooms(roomsData);
      } catch (error) {
        console.error(
          "Failed to fetch rooms for availability dashboard:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchRooms();
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-shpc-sand min-h-full flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-shpc-ink">Availability</h1>
          <p className="text-muted-foreground">
            Select a room to manage its calendar and pricing.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={`skel-${i}`}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="flex justify-end">
                  <Skeleton className="h-10 w-24" />
                </CardContent>
              </Card>
            ))
          : rooms.map((room) => (
              <Card
                key={room.id}
                className="shadow-soft rounded-2xl flex flex-col"
              >
                <CardHeader className="flex-grow">
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    {room.name}
                  </CardTitle>
                  <CardDescription>
                    {room.bedding} Bed / Up to {room.capacity} guests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/admin/availability/${room.slug}`}>
                      Manage Calendar <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}

        {!isLoading && rooms.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>No Rooms Found</CardTitle>
              <CardDescription>
                Create a room first to manage its availability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin/rooms/new">Create a Room</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

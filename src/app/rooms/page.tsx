"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { getRooms } from "@/server-actions";
import type { Room } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import GuestServicesCarousel from "@/components/guest-services-carousel";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRooms() {
      setIsLoading(true);
      try {
        const roomData = await getRooms();
        setRooms(roomData);
        console.log("Fetched rooms:", roomData);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRooms();
  }, []);

  const handleBookNow = (slug: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const from = tomorrow.toISOString().split("T")[0];
    const to = dayAfter.toISOString().split("T")[0];

    router.push(`/search?from=${from}&to=${to}&guests=2&room=${slug}`);
  };
  console.log('current page: rooms/slug/page.tsx');

  return (
    <div className="bg-shpc-sand">
      {/* Hero Section */}
      <section className="relative h-[50vh] w-full flex items-center justify-center text-center text-white bg-black">
        <Image
          src="https://picsum.photos/1600/800"
          alt="Beautifully styled room with sunlight streaming in"
          fill
          priority
          className="object-cover opacity-40"
          data-ai-hint="hotel room sun"
        />
        <div className="relative z-10 p-6">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold">
            Your Stay, Your Style ✨
          </h1>
          <p className="mt-4 text-lg md:text-2xl font-light max-w-2xl mx-auto">
            Each room tells its own story — choose the one that feels like
            yours.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="overflow-hidden shadow-soft rounded-2xl w-full flex flex-col group"
                >
                  <Skeleton className="aspect-video w-full" />
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex-grow" />
                    <div className="flex justify-end items-center mt-6">
                      <Skeleton className="h-10 w-48" />
                    </div>
                  </CardContent>
                </Card>
              ))
            : rooms.map((room) => (
                <Card
                  key={room.id}
                  className="overflow-hidden shadow-soft rounded-2xl w-full flex flex-col group"
                >
                  <Link
                    href={`/rooms/${room.slug}`}
                    className="block overflow-hidden"
                  >
                    <div className="relative aspect-video w-full">
                      <Image
                        src={
                          room.image ||
                          "https://picsum.photos/seed/room-placeholder/800/600"
                        }
                        alt={room.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint="hotel room interior"
                      />
                    </div>
                  </Link>
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <h3 className="font-playfair text-3xl font-bold text-shpc-ink">
                      {room.name}
                    </h3>
                    <p className="text-muted-foreground mt-2 flex-grow">
                      {room.tagline || "A perfect room for your stay."}
                    </p>
                    <div className="flex justify-end items-center mt-6">
                      <div className="flex items-center gap-2">
                        <Button
                          asChild
                          variant="outline"
                          className="rounded-full"
                        >
                          <Link href={`/rooms/${room.slug}`}>Step Inside</Link>
                        </Button>
                        <Button
                          onClick={() => handleBookNow(room.slug)}
                          className="rounded-full"
                        >
                          Book Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>

      <GuestServicesCarousel />
    </div>
  );
}

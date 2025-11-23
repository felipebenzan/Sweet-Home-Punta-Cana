
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { firestore } from "@/lib/firebase-admin";
import type { Room } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import GuestServicesCarousel from "@/components/guest-services-carousel";

// This is now a Server Component.

export const revalidate = 3600; // Re-fetch room data every hour

async function getRooms(): Promise<Room[]> {
    const snapshot = await firestore.collection('rooms').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
}

export default async function RoomsPage() {
  let rooms: Room[] = [];
  let fetchError: string | null = null;

  try {
    rooms = await getRooms();
  } catch (error) {
    console.error("[RoomsPage] Failed to fetch rooms:", error);
    fetchError = "We couldn't load our rooms right now. Please try again in a few moments.";
  }

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
            Each room tells its own story — choose the one that feels like yours.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        {fetchError ? (
           <div className="text-center py-12">
             <p className="text-lg text-destructive">{fetchError}</p>
             <Button asChild variant="outline" className="mt-4">
                <Link href="/">Return to Homepage</Link>
             </Button>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="overflow-hidden shadow-soft rounded-2xl w-full flex flex-col group"
              >
                <Link
                  href={`/rooms/${room.slug}`}
                  className="block overflow-hidden"
                  aria-label={`View details for ${room.name}`}
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
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full"
                    >
                      <Link href={`/rooms/${room.slug}`}>
                        View Details & Availability <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <GuestServicesCarousel />
    </div>
  );
}

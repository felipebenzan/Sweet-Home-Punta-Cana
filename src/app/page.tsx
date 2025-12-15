
'use client';

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Plane, Waves, Goal, Utensils, Sprout, BookOpen, CircleDotDashed, Gamepad2, Car, ArrowRight, Bike, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import InstagramFeed from '@/components/instagram-feed';
import BookingBar from '@/components/booking-bar';


export default function TheHousePage() {
  return (
    <div className="bg-shpc-sand text-shpc-ink">
      {/* Hero Section */}
      <section className="relative h-auto min-h-[80vh] w-full flex items-center justify-center text-center text-white bg-black">
        <Image
          src="/home-hero.png"
          alt="Lush tropical garden of a guest house"
          fill
          sizes="100vw"
          priority
          className="object-cover opacity-50"
          data-ai-hint="guest house tropical"
        />
        <div className="relative z-10 p-6 flex-grow flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold">
            Welcome Home, Sweet Home Punta Cana
          </h1>
          <p className="mt-4 text-lg md:text-2xl font-light">
            -a crafted local experience-
          </p>
        </div>
      </section>

      {/* Booking Bar */}
      {/* BookingBar */}
      <Suspense fallback={<div className="h-20 w-full bg-white/95" />}>
        <BookingBar />
      </Suspense>

      {/* Location Story */}
      <section className="pt-16 lg:pt-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square md:aspect-[3/4] rounded-2xl overflow-hidden shadow-soft">
            <Image src="/perectly%20placed.png" alt="Path lined with palm trees" fill sizes="100vw" className="object-cover" data-ai-hint="palm tree path" />
          </div>
          <div className="text-left">
            <h2 className="text-5xl md:text-7xl font-playfair font-bold">Perfectly Placed.</h2>
            <p className="mt-6 text-neutral-600 leading-relaxed max-w-md">
              Set in Bávaro — just 6 minutes from Downtown, 25 minutes from the airport, and a short stroll to white-sand beaches. Supermarket, pharmacy, cafés, and Cocotal Golf Course are all next door.
            </p>
            <div className="mt-8 space-y-3 text-sm text-neutral-500">
              <p className="flex items-center gap-3"><Plane className="h-4 w-4" />25 mins to PUJ Airport</p>
              <p className="flex items-center gap-3"><Waves className="h-4 w-4" />Walk/bike to the beach</p>
              <p className="flex items-center gap-3"><Goal className="h-4 w-4" />Cocotal Golf Course nearby</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shaped By Paradise */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-5xl md:text-6xl font-playfair font-bold mb-12">Shaped By Paradise.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-soft mb-4">
                <Image src="/Home%20Kitchen.png" alt="Modern home kitchen" fill sizes="100vw" className="object-cover" data-ai-hint="kitchen interior" />
              </div>
              <h3 className="font-bold text-lg flex items-center justify-center gap-2">Home Kitchen <Utensils className="h-5 w-5" /></h3>
              <p className="text-neutral-600 text-sm">Cook, snack, or sip coffee your way.</p>
            </div>
            <div className="text-center">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-soft mb-4">
                <Image src="/House%20Garden.png" alt="Peaceful garden patio" fill sizes="100vw" className="object-cover" data-ai-hint="garden patio" />
              </div>
              <h3 className="font-bold text-lg flex items-center justify-center gap-2">Garden Patio <Sprout className="h-5 w-5" /></h3>
              <p className="text-neutral-600 text-sm">A quiet corner to read, chat, or simply breathe.</p>
            </div>
            <div className="text-center">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-soft mb-4">
                <Image src="/high%20speed%20wifi.png" alt="High-speed internet setup" fill sizes="100vw" className="object-cover" data-ai-hint="wifi router" />
              </div>
              <h3 className="font-bold text-lg flex items-center justify-center gap-2">High-Speed Wi-Fi <Wifi className="h-5 w-5" /></h3>
              <p className="text-neutral-600 text-sm">Stream, work, or share your beach days without limits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Island Life Section */}
      <section className="relative py-24 lg:py-32 bg-black text-white">
        <Image src="/Island%20Life%20Simplified.png" alt="Aerial view of a tropical coastline" fill sizes="100vw" className="object-cover opacity-30" data-ai-hint="tropical coastline aerial" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-playfair font-bold">Island Life, Simplified.</h2>
          <div className="mt-12 flex flex-wrap justify-center items-start gap-x-8 gap-y-6 max-w-5xl mx-auto text-lg">
            <div className="flex flex-col items-center gap-2 w-36"><Gamepad2 className="h-8 w-8" /><strong>Tennis & Football</strong> inside the complex</div>
            <div className="flex flex-col items-center gap-2 w-36"><Goal className="h-8 w-8" /><strong>World-class golf</strong> next door</div>
            <div className="flex flex-col items-center gap-2 w-36"><Car className="h-8 w-8" /><strong>Uber & buses</strong> connect you everywhere</div>
            <div className="flex flex-col items-center gap-2 w-36"><CircleDotDashed className="h-8 w-8" /><strong>Food delivery</strong> apps to your doorstep</div>
            <div className="flex flex-col items-center gap-2 w-36"><Waves className="h-8 w-8" /><strong>Bavaro beach</strong> Walk or bike to award wining Bavaro beach</div>
          </div>
        </div>
      </section>

      {/* Closing Invitation */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-playfair text-4xl md:text-6xl leading-tight">
            “It’s the kind of space where you fall asleep easily, wake up rested.”
          </p>
          <Button asChild size="lg" className="mt-8 rounded-full">
            <Link href="/rooms">See Our Rooms <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>


      {/* Instagram Feed Section */}
      <InstagramFeed />
    </div>
  );
}

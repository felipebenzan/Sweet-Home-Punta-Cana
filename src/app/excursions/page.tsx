// Excursions page – now a server component that reads data from local JSON file
import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Sun } from 'lucide-react';
import type { Excursion } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getExcursions } from '@/app/server-actions.readonly';
import { revalidatePath } from 'next/cache';

export const revalidate = 0; // Disable cache for instant updates

export default async function ExcursionsPage() {
  const allExcursions = await getExcursions();

  return (
    <div className="bg-shpc-sand">
      {/* Hero Section */}
      <section className="relative h-[50vh] w-full flex items-center justify-center text-center text-white bg-black">
        <Image
          src="/excursions hero.png"
          alt="A collage of exciting excursions in Punta Cana"
          fill
          priority
          className="object-cover opacity-40"
          data-ai-hint="vacation excursion"
        />
        <div className="relative z-10 p-6">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold">Excursions & Tours ✨</h1>
          <p className="mt-4 text-lg md:text-2xl font-light max-w-2xl mx-auto">
            From Caribbean islands to city streets — curated journeys made seamless for you.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {allExcursions && allExcursions.length > 0 ? (
            allExcursions.map((excursion) => (
              <Card key={excursion.id} className="overflow-hidden shadow-soft rounded-2xl w-full flex flex-col group">
                <Link href={`/excursions/${excursion.slug}`} className="block overflow-hidden">
                  <div className="relative aspect-video w-full">
                    <Image
                      src={excursion.image}
                      alt={excursion.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint="vacation excursion"
                    />
                  </div>
                </Link>
                <CardContent className="p-6 flex flex-col flex-grow">
                  <h3 className="font-playfair text-2xl font-bold text-shpc-ink">{excursion.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 flex-grow">{excursion.tagline}</p>
                  <div className="flex items-center text-sm text-muted-foreground gap-6 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <span>{excursion.practicalInfo?.departure || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{excursion.practicalInfo?.duration || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 pb-6 flex justify-between items-center">
                  <div>
                    <span className="text-sm text-muted-foreground">From </span>
                    <span className="text-2xl font-bold text-foreground">${excursion.price.adult.toFixed(2)}</span>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/excursions/${excursion.slug}`}>View Details <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="md:col-span-2 text-center py-16">
              <h2 className="text-2xl font-semibold text-shpc-ink">Coming Soon!</h2>
              <p className="mt-2 text-neutral-600">We are busy curating the best local experiences. Check back soon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Scooter Promo Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-2xl shadow-soft overflow-hidden bg-shpc-ink text-white">
            <Image
              src="/scooters%20punta%20cana%20sweet%20home%20banner.png"
              alt="Scooter against a tropical background"
              fill
              className="object-cover opacity-40"
              data-ai-hint="scooter rental"
            />
            <div className="relative p-6 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold font-playfair">Explore on Two Wheels</h2>
                <p className="mt-4 text-lg text-white/80">“From Sweet Home to Every Corner of Paradise – Rent Your Scooter Today”</p>
              </div>
              <Button asChild size="lg" className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 shrink-0">
                <a href="https://www.scooterspc.com" target="_blank" rel="noopener noreferrer">Reserve a Scooter <ArrowRight className="ml-2 h-4 w-4" /></a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Sun } from 'lucide-react';
import type { Excursion } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function ExcursionsPage() {
  const db = useFirestore();

  const excursionsQuery = useMemoFirebase(() => 
    db ? collection(db, 'excursions') : null
  , [db]);
  console.log('current page excursion/page')

  const { data: allExcursions, isLoading } = useCollection<Excursion>(excursionsQuery);
    
  return (
    <div className="bg-shpc-sand">
       <section className="relative h-[50vh] w-full flex items-center justify-center text-center text-white bg-black">
         <Image
          src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/tours%20and%20excursion%20sweet%20home%20punta%20cana.png?alt=media&token=d1f65e98-ebe8-4044-a7ec-c48338256155"
          alt="A collage of exciting excursions in Punta Cana"
          fill
          priority
          className="object-cover opacity-40"
          data-ai-hint="vacation excursion"
        />
        <div className="relative z-10 p-6">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold">
            Excursions & Tours ✨
          </h1>
          <p className="mt-4 text-lg md:text-2xl font-light max-w-2xl mx-auto">
            From Caribbean islands to city streets — curated journeys made seamless for you.
          </p>
        </div>
       </section>

      <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isLoading ? (
            Array.from({length: 4}).map((_, i) => (
              <Card key={`skel-${i}`} className="overflow-hidden shadow-soft rounded-2xl w-full flex flex-col group">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-6 flex flex-col flex-grow">
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex-grow" />
                  <div className="flex items-center text-sm text-muted-foreground gap-6 mt-4 pt-4 border-t">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </CardContent>
                <div className="px-6 pb-6 flex justify-between items-center">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
              </Card>
            ))
          ) : allExcursions && allExcursions.length > 0 ? (
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
                  <h3 className="font-playfair text-2xl font-bold text-shpc-ink">
                    {excursion.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 flex-grow">{excursion.tagline}</p>
                  
                   <div className="flex items-center text-sm text-muted-foreground gap-6 mt-4 pt-4 border-t">
                     <div className="flex items-center gap-2">
                       <Sun className="h-4 w-4"/>
                       <span>{excursion.practicalInfo?.departure || 'N/A'}</span>
                     </div>
                      <div className="flex items-center gap-2">
                       <Clock className="h-4 w-4"/>
                       <span>{excursion.practicalInfo?.duration || 'N-A'}</span>
                     </div>
                  </div>

                </CardContent>
                <div className="px-6 pb-6 flex justify-between items-center">
                    <div>
                      <span className="text-sm text-muted-foreground">From </span>
                      <span className="text-2xl font-bold text-foreground">${excursion.price.adult.toFixed(2)}</span>
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/excursions/${excursion.slug}`}>
                          View Details <ArrowRight className="ml-2 h-4 w-4"/>
                      </Link>
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

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-2xl shadow-soft overflow-hidden bg-shpc-ink text-white">
            <Image 
              src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/vespa%20scooters%20rental%20sweet%20home%20punta%20cana.png?alt=media&token=3f42e248-bf5a-4979-8b2e-4f8dc746c4bf"
              alt="Scooter against a tropical background"
              fill
              className="object-cover opacity-40"
              data-ai-hint="scooter rental"
            />
            <div className="relative p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold font-playfair">Explore on Two Wheels</h2>
                <p className="mt-4 text-lg text-white/80">
                  “From Sweet Home to Every Corner of Paradise – Rent Your Scooter Today”
                </p>
              </div>
              <Button asChild size="lg" className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 shrink-0">
                <a href="https://www.scooterspc.com" target="_blank" rel="noopener noreferrer">
                  Reserve a Scooter <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

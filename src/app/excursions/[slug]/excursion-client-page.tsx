'use client';

import type { Excursion } from '@/lib/types';
import Image from 'next/image';
import {
  Check,
  MapPin,
  ExternalLink,
  Sun,
  Clock,
  Info,
  List,
  Sparkles,
  ArrowRight,
  X,
  Calendar as CalendarIcon,
  Users,
  Plus,
  Minus,
  Tag,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import * as React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import EmbeddedMap from '@/components/embedded-map';
import { ExcursionBookingWidget } from '@/components/excursions/excursion-booking-widget';

function BundleOfferCard({
  excursion,
  onToggleBundle,
  isBundled,
}: {
  excursion: Excursion;
  onToggleBundle: (excursion: Excursion) => void;
  isBundled: boolean;
}) {
  return (
    <Card className="overflow-hidden shadow-soft rounded-2xl w-full flex flex-col data-[bundled=true]:ring-2 data-[bundled=true]:ring-primary" data-bundled={isBundled}>
      <div className="relative aspect-[4/3] w-full">
        <Image src={excursion.image} alt={excursion.title} fill className="object-cover" data-ai-hint="vacation excursion" />
        {isBundled && <div className="absolute inset-0 bg-shpc-yellow/20 flex items-center justify-center"><Check className="h-12 w-12 text-white bg-shpc-yellow/80 rounded-full p-2" /></div>}
      </div>
      <CardContent className="p-4 flex-grow">
        <h3 className="font-bold text-lg">{excursion.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{excursion.tagline}</p>
      </CardContent>
      <div className="p-4 bg-shpc-sand/50 mt-auto">
        <div className="flex items-center justify-between w-full">
          <div>
            <span className="text-sm text-muted-foreground">From </span>
            <span className="font-bold text-xl">${excursion.price.adult.toFixed(2)}</span>
          </div>
          <Button onClick={() => onToggleBundle(excursion)} variant={isBundled ? 'secondary' : 'default'} size="sm" className="data-[state=bundled]:bg-shpc-yellow/80 data-[state=bundled]:text-shpc-ink">
            {isBundled ? 'Remove' : 'Add to bundle'}
          </Button>
        </div>
      </div>
      <Accordion type="single" collapsible className="w-full bg-shpc-sand/50">
        <AccordionItem value="item-1" className="border-t">
          <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline">
            More info
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4 text-xs">
            <p className="text-muted-foreground">{excursion.description.substring(0, 150)}...</p>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2"><List className="h-4 w-4" />Includes</h4>
              <ul className="list-disc list-inside text-muted-foreground">
                {excursion.inclusions.slice(0, 3).map(item => <li key={item}>{item}</li>)}
                {excursion.inclusions.length > 3 && <li>And more...</li>}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}


export default function ExcursionClientPage({ excursion, otherExcursions, googleMapsApiKey }: { excursion: Excursion, otherExcursions: Excursion[], googleMapsApiKey: string }) {
  // State for bundled items (simplified for now as focus is on main widget)
  const [bundledItems, setBundledItems] = React.useState<Record<string, Excursion>>({});

  const handleToggleBundle = (toggledExcursion: Excursion) => {
    setBundledItems(prev => {
      const newBundled = { ...prev };
      if (newBundled[toggledExcursion.id]) {
        delete newBundled[toggledExcursion.id];
      } else {
        newBundled[toggledExcursion.id] = toggledExcursion;
      }
      return newBundled;
    });
  };

  return (
    <div className="bg-shpc-sand">
      {/* Hero Section - Elegant Overlay */}
      <section className="relative h-[60vh] bg-shpc-ink">
        <Image
          src={excursion.image}
          alt={excursion.title}
          fill
          className="object-cover opacity-40"
          priority
          data-ai-hint="tropical island beach"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-shpc-ink/40 via-transparent to-shpc-ink/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
          <h1 className="font-playfair text-5xl md:text-7xl font-bold mb-4">{excursion.title}</h1>
          <p className="font-inter text-xl md:text-2xl max-w-3xl text-white/90">{excursion.tagline}</p>
        </div>
      </section>

      {/* Mobile Booking Widget Instance (Hidden on Desktop) */}
      <div className="lg:hidden relative z-50">
        <ExcursionBookingWidget
          id={excursion.id}
          title={excursion.title}
          basePrice={excursion.price.adult}
          priceChild={excursion.price.children}
          imageUrl={excursion.image}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 max-w-7xl mx-auto p-4 lg:p-8 gap-8 lg:gap-12 pb-32">

        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-12">
          {/* Description */}
          <section>
            <h2 className="font-playfair text-4xl font-bold text-shpc-ink mb-6">About the Adventure</h2>
            <p className="font-inter text-lg text-neutral-700 leading-relaxed whitespace-pre-line">
              {excursion.description}
            </p>
          </section>

          {/* Inclusions */}
          <section>
            <h2 className="font-playfair text-4xl font-bold text-shpc-ink mb-8">What's Included</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
              {excursion.inclusions.map(item => (
                <li key={item} className="flex items-start gap-4">
                  <Check className="h-5 w-5 text-shpc-yellow shrink-0 mt-1" strokeWidth={3} />
                  <span className="font-inter text-neutral-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Practical Info */}
          <section>
            <h2 className="font-playfair text-4xl font-bold text-shpc-ink mb-8">Practical Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <div className="bg-shpc-sand/30 border border-shpc-edge rounded-lg p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <MapPin className="h-7 w-7 text-shpc-yellow" />
                    <h3 className="font-playfair text-xl font-semibold text-shpc-ink">Pick Up Location</h3>
                  </div>
                  <p className="font-inter text-neutral-700 mb-4">{excursion.practicalInfo.pickup}</p>
                  {excursion.practicalInfo.pickupMapLink && (
                    <>
                      <div className="aspect-video w-full rounded-lg overflow-hidden mb-3">
                        <EmbeddedMap mapUrl={excursion.practicalInfo.pickupMapLink} origin="Sweet Home Punta Cana" mode="walking" zoom={15} apiKey={googleMapsApiKey} />
                      </div>
                      <a href={excursion.practicalInfo.pickupMapLink} target="_blank" rel="noopener noreferrer" className="text-sm text-shpc-yellow hover:text-shpc-yellow/80 font-inter font-medium flex items-center gap-2">
                        Open in Google Maps <ExternalLink className="h-4 w-4" />
                      </a>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-shpc-sand/30 border border-shpc-edge rounded-lg p-8">
                <div className="flex items-center gap-4 mb-3">
                  <Sun className="h-7 w-7 text-shpc-yellow" />
                  <h3 className="font-playfair text-xl font-semibold text-shpc-ink">Departure</h3>
                </div>
                <p className="font-inter text-neutral-700">{excursion.practicalInfo.departure}</p>
              </div>
              <div className="bg-shpc-sand/30 border border-shpc-edge rounded-lg p-8">
                <div className="flex items-center gap-4 mb-3">
                  <Clock className="h-7 w-7 text-shpc-yellow" />
                  <h3 className="font-playfair text-xl font-semibold text-shpc-ink">Duration</h3>
                </div>
                <p className="font-inter text-neutral-700">{excursion.practicalInfo.duration}</p>
              </div>
              <div className="col-span-2">
                <div className="bg-shpc-sand/30 border border-shpc-edge rounded-lg p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <Info className="h-7 w-7 text-shpc-yellow" />
                    <h3 className="font-playfair text-xl font-semibold text-shpc-ink">Good to Know</h3>
                  </div>
                  <ul className="space-y-3 font-inter text-neutral-700">
                    {excursion.practicalInfo.notes.map(note => (
                      <li key={note} className="flex items-start gap-3">
                        <span className="text-shpc-yellow mt-1">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Bundle & Save Section */}
          <section>
            <h2 className="font-playfair text-4xl font-bold text-shpc-ink mb-3">Bundle & Save!</h2>
            <p className="font-inter text-lg text-neutral-600 mb-8">Add another tour and get <span className="font-semibold text-shpc-yellow">10% off</span> your entire booking.</p>
            <Carousel
              opts={{
                align: 'start',
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-6">
                {otherExcursions.map(other => (
                  <CarouselItem key={other.id} className="pl-6 basis-full md:basis-1/2">
                    <div className="h-full">
                      <BundleOfferCard
                        excursion={other}
                        onToggleBundle={handleToggleBundle}
                        isBundled={!!bundledItems[other.id]}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </section>

          {/* Gallery */}
          <section>
            <h2 className="font-playfair text-4xl font-bold text-shpc-ink mb-8">Gallery</h2>
            <Carousel
              opts={{ loop: true }}
              plugins={[
                Autoplay({
                  delay: 3000,
                  stopOnInteraction: true,
                }),
              ]}
            >
              <CarouselContent>
                {excursion.gallery.map((img, index) => (
                  <CarouselItem key={index} className="md:basis-1/2">
                    <Image
                      src={img}
                      alt={`${excursion.title} gallery image ${index + 1}`}
                      width={800}
                      height={600}
                      className="rounded-lg object-cover aspect-video"
                      data-ai-hint="vacation excursion"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </section>

          {/* Scooter CTA */}
          <section>
            <div className="relative rounded-lg shadow-lg overflow-hidden bg-shpc-ink text-white">
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
                  <p className="mt-4 text-lg text-white/80 font-inter">
                    "From Sweet Home to Every Corner of Paradise – Rent Your Scooter Today"
                  </p>
                </div>
                <Button asChild size="lg" className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 shrink-0 font-semibold">
                  <a href="https://www.scooterspc.com" target="_blank" rel="noopener noreferrer">
                    Reserve a Scooter <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* Desktop Sidebar Booking Widget (Sticky) */}
        <div className="hidden lg:block lg:col-span-1">
          <ExcursionBookingWidget
            id={excursion.id}
            title={excursion.title}
            basePrice={excursion.price.adult}
            priceChild={excursion.price.children}
            imageUrl={excursion.image}
          />
        </div>

      </div>
    </div>
  );
}

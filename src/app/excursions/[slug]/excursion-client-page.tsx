'use client';

import type { Excursion } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
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

function CrossSellCard({ excursion }: { excursion: Excursion }) {
  return (
    <Card className="overflow-hidden shadow-soft rounded-2xl w-full flex flex-col h-full group">
      <Link href={`/excursions/${excursion.slug}`} className="block relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={excursion.image}
          alt={excursion.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="vacation excursion"
        />
      </Link>
      <CardContent className="p-4 flex-grow flex flex-col">
        <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-shpc-yellow transition-colors">
          <Link href={`/excursions/${excursion.slug}`}>
            {excursion.title}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{excursion.tagline}</p>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block">From </span>
            <span className="font-bold text-lg">${excursion.price.adult.toFixed(2)}</span>
          </div>
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href={`/excursions/${excursion.slug}`}>View <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExcursionClientPage({ excursion, otherExcursions, googleMapsApiKey }: { excursion: Excursion, otherExcursions: Excursion[], googleMapsApiKey: string }) {

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

          {/* Cross Sell Section (Formerly Bundle & Save) */}
          <section>
            <h2 className="font-playfair text-3xl font-bold text-shpc-ink mb-6">You Might Also Like</h2>
            <Carousel
              opts={{
                align: 'start',
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {otherExcursions.map(other => (
                  <CarouselItem key={other.id} className="pl-4 basis-full sm:basis-1/2">
                    <div className="h-full">
                      <CrossSellCard excursion={other} />
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
            imageUrl={excursion.image}
          />
        </div>

      </div>
    </div>
  );
}

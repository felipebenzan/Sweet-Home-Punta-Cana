
'use client';

import type { Excursion } from '@/lib/types';
import Image from 'next/image';
import { notFound, useParams, useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Users,
  Plus,
  Minus,
  Sun,
  Clock,
  Info,
  Check,
  Phone,
  Tag,
  List,
  Sparkles,
  MapPin,
  ArrowRight,
  ExternalLink,
  X,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays, isSameDay } from 'date-fns';
import * as React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import EmbeddedMap from '@/components/embedded-map';
import { Skeleton } from '@/components/ui/skeleton';

interface BundledItem extends Excursion {
  bookingDate?: Date;
  adults: number;
}

type GuestCounterProps = {
  label: string;
  count: number;
  onCountChange: (count: number) => void;
  price?: number;
  isDisabled?: boolean;
  min?: number;
};

// Simplified child component for the guest counters
function GuestCounter({
  label,
  count,
  onCountChange,
  price,
  isDisabled = false,
  min = 0,
}: GuestCounterProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="font-medium text-sm">{label}</p>
        {price !== undefined && <p className="text-xs text-muted-foreground">${price}/person</p>}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onCountChange(Math.max(min, count - 1))}
          disabled={isDisabled}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="font-semibold text-base w-7 text-center">{count}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onCountChange(count + 1)}
          disabled={isDisabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


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
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4" />Recommendations</h4>
              <ul className="list-disc list-inside text-muted-foreground">
                {excursion.practicalInfo.notes.slice(0, 2).map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}


export default function ExcursionClientPage({ excursion, otherExcursions }: { excursion: Excursion, otherExcursions: Excursion[] }) {
  // State for the main excursion
  const [mainExcursionState, setMainExcursionState] = React.useState<Omit<BundledItem, keyof Excursion>>({
    bookingDate: undefined,
    adults: 2,
  });

  // State for bundled items
  const [bundledItems, setBundledItems] = React.useState<Record<string, BundledItem>>({});

  const handleToggleBundle = (toggledExcursion: Excursion) => {
    setBundledItems(prev => {
      const newBundled = { ...prev };
      if (newBundled[toggledExcursion.id]) {
        delete newBundled[toggledExcursion.id];
      } else {
        newBundled[toggledExcursion.id] = {
          ...toggledExcursion,
          bookingDate: undefined,
          adults: 1,
        };
      }
      return newBundled;
    });
  };

  const handleBundledItemChange = (excursionId: string, updatedValues: Partial<BundledItem>) => {
    setBundledItems(prev => ({
      ...prev,
      [excursionId]: { ...prev[excursionId], ...updatedValues }
    }));
  };

  const bundledAsArray = Object.values(bundledItems);

  const mainExcursionDate = mainExcursionState.bookingDate;
  const allItemsValid = bundledAsArray.every(item => item.bookingDate && (!mainExcursionDate || !isSameDay(item.bookingDate, mainExcursionDate)));
  const isBookable = !!(mainExcursionDate && allItemsValid);
  console.log('current page: excursion/slug/excursion-client-page');


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

      {/* Mobile Booking Widget - Below Hero */}
      <div className="lg:hidden bg-white p-4 border-b border-neutral-200">
        <BookingForm
          mainExcursion={{ ...excursion, ...mainExcursionState }}
          onMainExcursionChange={setMainExcursionState}
          bundledItems={bundledAsArray}
          onBundledItemChange={handleBundledItemChange}
          onRemoveBundledItem={(id) => handleToggleBundle({ id } as Excursion)}
          isBookable={isBookable}
          isMobile={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 max-w-7xl mx-auto p-4 lg:p-8 gap-8 lg:gap-12">

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <div className="bg-shpc-sand/30 border border-shpc-edge rounded-lg p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <MapPin className="h-7 w-7 text-shpc-yellow" />
                    <h3 className="font-playfair text-xl font-semibold text-shpc-ink">Pick Up Location</h3>
                  </div>
                  <p className="font-inter text-neutral-700 mb-4">{excursion.practicalInfo.pickup}</p>
                  {excursion.practicalInfo.pickupMapLink && (
                    <>
                      <div className="aspect-video w-full rounded-lg overflow-hidden mb-3">
                        <EmbeddedMap mapUrl={excursion.practicalInfo.pickupMapLink} origin="Sweet Home Punta Cana" mode="walking" zoom={15} />
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
              <div className="md:col-span-2">
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
              <div className="relative p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
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

        {/* Booking Widget - Compact Sticky Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-white rounded-lg shadow-lg mb-12">
              {/* Header */}
              <div className="px-10 py-8 border-b border-neutral-200">
                <h3 className="font-playfair text-xl font-semibold text-shpc-ink uppercase tracking-wide">
                  Book Your Adventure
                </h3>
              </div>

              {/* Booking Form Content - No Internal Scroll */}
              <BookingForm
                mainExcursion={{ ...excursion, ...mainExcursionState }}
                onMainExcursionChange={setMainExcursionState}
                bundledItems={bundledAsArray}
                onBundledItemChange={handleBundledItemChange}
                onRemoveBundledItem={(id) => handleToggleBundle({ id } as Excursion)}
                isBookable={isBookable}
                isMobile={false}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


// New component to keep the booking logic together
function BookingForm({
  mainExcursion,
  onMainExcursionChange,
  bundledItems,
  onBundledItemChange,
  onRemoveBundledItem,
  isBookable,
}: {
  mainExcursion: BundledItem;
  onMainExcursionChange: (newState: Omit<BundledItem, keyof Excursion>) => void;
  bundledItems: BundledItem[];
  onBundledItemChange: (id: string, updatedValues: Partial<BundledItem>) => void;
  onRemoveBundledItem: (id: string) => void;

  isBookable: boolean;
  isMobile?: boolean;
}) {
  const router = useRouter();

  const mainExcursionPrice = (mainExcursion.adults * mainExcursion.price.adult);
  const mainExcursionDate = mainExcursion.bookingDate;

  const bundledPrice = bundledItems.reduce((total, item) => {
    return total + (item.adults * item.price.adult);
  }, 0);

  const subtotal = mainExcursionPrice + bundledPrice;
  const totalItems = 1 + bundledItems.length;
  const bundleDiscount = totalItems > 1 ? subtotal * 0.10 : 0;
  const totalPrice = subtotal - bundleDiscount;

  const getPriceForItem = (item: { price: Excursion['price'], adults: number }) => {
    return (item.adults * item.price.adult);
  }

  const handleBookNow = () => {
    if (!isBookable) return;

    const bookingDetails = {
      mainExcursion: {
        ...mainExcursion,
        bookingDate: mainExcursion.bookingDate?.toISOString()
      },
      bundledItems: bundledItems.map(item => ({ ...item, bookingDate: item.bookingDate?.toISOString() })),
      totalPrice,
      bundleDiscount,
    };
    // Use a different key for excursion bookings
    localStorage.setItem('excursionBookingDetails', JSON.stringify(bookingDetails));
    router.push('/checkout/excursions');
  };

  const getDisabledDays = () => {
    const now = new Date();
    // 6 PM is 18:00 in 24-hour format
    if (now.getHours() >= 18) {
      // If it's 6 PM or later, disable today and tomorrow.
      // The earliest bookable date is the day after tomorrow.
      return { before: addDays(new Date(), 2) };
    }
    // Otherwise, just disable today.
    // The earliest bookable date is tomorrow.
    return { before: addDays(new Date(), 1) };
  };

  const [mainCalendarOpen, setMainCalendarOpen] = React.useState(false);
  const [bundleCalendarOpen, setBundleCalendarOpen] = React.useState<Record<string, boolean>>({});

  return (
    <div className={cn("space-y-0", isMobile && "space-y-4")}>
      {/* Main Excursion Inputs */}
      <div className={cn(
        isMobile ? "grid grid-cols-3 gap-2 items-end" : "px-10 py-6 space-y-4"
      )}>
        {/* Mobile: Hidden Title */}
        {!isMobile && (
          <div className="flex items-center gap-3">
            <Image src={mainExcursion.image} alt={mainExcursion.title} width={60} height={45} className="rounded-lg object-cover aspect-video" data-ai-hint="vacation excursion" />
            <p className="font-inter font-semibold text-sm text-shpc-ink">{mainExcursion.title}</p>
          </div>
        )}

        {/* Date Selection */}
        <div className="space-y-2">
          <label className={cn(
            "font-inter text-xs font-medium text-neutral-700 flex items-center gap-2",
            isMobile && "sr-only"
          )}>
            <CalendarIcon className="h-3.5 w-3.5 text-neutral-500" />
            Date
          </label>
          <Popover open={mainCalendarOpen} onOpenChange={setMainCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  "w-full justify-start text-left font-normal text-sm border-neutral-300 rounded-none hover:border-shpc-yellow focus:border-shpc-yellow px-0 py-3",
                  !isMobile && "border-0 border-b",
                  isMobile && "border h-12 px-3 rounded text-xs"
                )}
              >
                {mainExcursionDate ? format(mainExcursionDate, isMobile ? 'MMM d' : 'PPP') : <span className="text-neutral-400">Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={mainExcursionDate}
                onSelect={(date) => {
                  onMainExcursionChange({ ...mainExcursion, bookingDate: date });
                  setMainCalendarOpen(false);
                }}
                initialFocus
                disabled={getDisabledDays()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Adults Counter */}
        <div className="space-y-2">
          <label className={cn(
            "font-inter text-xs font-medium text-neutral-700 flex items-center gap-2",
            isMobile && "sr-only"
          )}>
            <Users className="h-3.5 w-3.5 text-neutral-500" />
            Adults
          </label>
          <div className={cn(
            "flex items-center justify-between py-3",
            !isMobile && "border-b border-neutral-300",
            isMobile && "border border-neutral-300 rounded h-12 px-2"
          )}>
            {!isMobile && <span className="text-xs text-neutral-600">${mainExcursion.price.adult}/person</span>}
            <div className={cn("flex items-center gap-2 w-full justify-between", isMobile && "px-0")}>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full border-shpc-yellow text-shpc-yellow hover:bg-shpc-yellow hover:text-shpc-ink shrink-0"
                onClick={() => onMainExcursionChange({ ...mainExcursion, adults: Math.max(1, mainExcursion.adults - 1) })}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="font-semibold text-base w-6 text-center">{mainExcursion.adults}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full border-shpc-yellow text-shpc-yellow hover:bg-shpc-yellow hover:text-shpc-ink shrink-0"
                onClick={() => onMainExcursionChange({ ...mainExcursion, adults: mainExcursion.adults + 1 })}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile: Book Now Button in 3rd Column */}
        {isMobile && (
          <Button
            size="lg"
            className="w-full bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 font-semibold h-12 text-xs px-1 uppercase leading-tight"
            disabled={!isBookable}
            onClick={handleBookNow}
          >
            BOOK NOW
          </Button>
        )}
      </div>


      {/* Bundled Items */}
      {
        bundledItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <Separator />
            <div className="px-10 py-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 flex-grow">
                  <Image src={item.image} alt={item.title} width={60} height={45} className="rounded-lg object-cover aspect-video" data-ai-hint="vacation excursion" />
                  <div>
                    <p className="font-inter font-semibold text-sm text-shpc-ink">{item.title}</p>
                    <span className="text-xs text-shpc-yellow font-medium">Bundled</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:bg-red-50 hover:text-red-600" onClick={() => onRemoveBundledItem(item.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <label className="font-inter text-xs font-medium text-neutral-700 flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5 text-neutral-500" />
                  Date
                </label>
                <Popover open={bundleCalendarOpen[item.id] || false} onOpenChange={(isOpen) => setBundleCalendarOpen(prev => ({ ...prev, [item.id]: isOpen }))}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className="w-full justify-start text-left font-normal text-sm border-0 border-b border-neutral-300 rounded-none hover:border-shpc-yellow focus:border-shpc-yellow px-0 py-3"
                    >
                      {item.bookingDate ? format(item.bookingDate, 'PPP') : <span className="text-neutral-400">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={item.bookingDate}
                      onSelect={(date) => {
                        onBundledItemChange(item.id, { bookingDate: date });
                        setBundleCalendarOpen(prev => ({ ...prev, [item.id]: false }));
                      }}
                      initialFocus
                      disabled={(date) => {
                        const now = new Date();
                        const isAfter6PM = now.getHours() >= 18;
                        const earliestDate = addDays(new Date(), isAfter6PM ? 2 : 1);
                        earliestDate.setHours(0, 0, 0, 0);

                        if (!date) return true;

                        const isBeforeEarliest = date < earliestDate;
                        const isMainDate = mainExcursionDate ? isSameDay(date, mainExcursionDate) : false;
                        return isBeforeEarliest || isMainDate;
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {mainExcursionDate && item.bookingDate && isSameDay(mainExcursionDate, item.bookingDate) && (
                  <p className="text-red-600 text-xs font-inter">Bundled excursions cannot be on the same day.</p>
                )}
              </div>

              {/* Adults Counter */}
              <div className="space-y-2">
                <label className="font-inter text-xs font-medium text-neutral-700 flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-neutral-500" />
                  Adults
                </label>
                <div className="flex items-center justify-between py-3 border-b border-neutral-300">
                  <span className="text-xs text-neutral-600">${item.price.adult}/person</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full border-shpc-yellow text-shpc-yellow hover:bg-shpc-yellow hover:text-shpc-ink"
                      onClick={() => onBundledItemChange(item.id, { adults: Math.max(1, item.adults - 1) })}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-semibold text-base w-6 text-center">{item.adults}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full border-shpc-yellow text-shpc-yellow hover:text-shpc-ink hover:bg-shpc-yellow"
                      onClick={() => onBundledItemChange(item.id, { adults: item.adults + 1 })}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        ))
      }

      {/* Summary Section */}
      <div className={cn("border-t-2 border-neutral-300", isMobile && "hidden")}></div>
      <div className={cn("px-10 py-6 space-y-4", isMobile && "px-0 py-0")}>
        {!isMobile && <h3 className="font-playfair text-lg font-semibold text-shpc-ink">Summary</h3>}

        <div className="space-y-2 text-sm font-inter">
          <div className="flex justify-between items-start">
            <span className="text-neutral-600 text-xs">{mainExcursion.title} ({mainExcursion.adults} Adults)</span>
            <span className="font-semibold text-shpc-ink text-sm">${getPriceForItem({ price: mainExcursion.price, adults: mainExcursion.adults }).toFixed(2)}</span>
          </div>
          {bundledItems.map(item => (
            <div key={item.id} className="flex justify-between items-start">
              <span className="text-neutral-600 text-xs flex-1 pr-2">{item.title} ({item.adults} Adults)</span>
              <span className="font-semibold text-shpc-ink text-sm">${getPriceForItem(item).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {bundleDiscount > 0 && (
          <div className="flex justify-between items-center text-sm font-inter">
            <span className="flex items-center gap-1.5 text-green-600 font-medium text-xs">
              <Tag className="h-3.5 w-3.5" />
              Bundle Savings (10%)
            </span>
            <span className="font-semibold text-green-600 text-sm">-${bundleDiscount.toFixed(2)}</span>
          </div>
        )}

        {/* Total - Prominent Display */}
        {/* Total - Prominent Display - Hidden on Mobile */}
        {!isMobile && (
          <div className="pt-4 border-t-2 border-neutral-400">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-inter text-xs uppercase tracking-wide text-neutral-700">Total</span>
              <span className="font-playfair text-3xl font-bold text-shpc-ink">${totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-xs text-green-600 font-inter flex items-center gap-1 justify-end">
              <CheckCircle className="h-3 w-3" />
              Taxes and fees included
            </p>
          </div>
        )}

        {/* CTA Button - Desktop Only (Mobile is in column 3) */}
        {!isMobile && (
          <Button
            size="lg"
            className="w-full bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 font-semibold py-6 text-sm"
            disabled={!isBookable}
            onClick={handleBookNow}
          >
            {isBookable ? 'Book Now' : 'Complete selections'}
          </Button>
        )}
        {!isBookable && (
          <p className="text-xs text-center text-neutral-500 font-inter">Please select a date for all excursions to continue.</p>
        )}
      </div>
    </div >
  );
}

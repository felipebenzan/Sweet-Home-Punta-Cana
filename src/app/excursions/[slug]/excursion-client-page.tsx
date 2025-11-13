
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
                <h4 className="font-semibold flex items-center gap-2"><List className="h-4 w-4"/>Includes</h4>
                <ul className="list-disc list-inside text-muted-foreground">
                  {excursion.inclusions.slice(0, 3).map(item => <li key={item}>{item}</li>)}
                   {excursion.inclusions.length > 3 && <li>And more...</li>}
                </ul>
              </div>
              <div className="space-y-2">
                 <h4 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4"/>Recommendations</h4>
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
  const isBookable = mainExcursionDate && allItemsValid;
  console.log('current page: excursion/slug/excursion-client-page');


  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[50vh] bg-black">
        <Image
          src={excursion.image}
          alt={excursion.title}
          fill
          className="object-cover opacity-60"
          priority
          data-ai-hint="tropical island beach"
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-6">
          <h1 className="text-4xl md:text-6xl font-bold">{excursion.title}</h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl">{excursion.tagline}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <section>
              <h2 className="text-3xl font-bold text-shpc-ink mb-4">About the Excursion</h2>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-line">{excursion.description}</p>
            </section>
            
            {/* Inclusions */}
            <section>
              <h2 className="text-3xl font-bold text-shpc-ink mb-4">What's Included</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {excursion.inclusions.map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="h-6 w-6 text-green-500 bg-green-100 rounded-full p-1" />
                    <span className="text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

             {/* Bundle & Save Section */}
            <section>
              <h2 className="text-3xl font-bold text-shpc-ink mb-2">Bundle & Save!</h2>
              <p className="text-muted-foreground mb-6">Add another tour and get 10% off your entire booking.</p>
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

            {/* Practical Info */}
            <section>
              <h2 className="text-3xl font-bold text-shpc-ink mb-6">Practical Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Card className="bg-shpc-sand/50 border-none">
                    <CardHeader className="flex-row items-center gap-4">
                      <MapPin className="h-8 w-8 text-shpc-yellow" />
                      <CardTitle className="text-lg">Pick Up Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">{excursion.practicalInfo.pickup}</p>
                      {excursion.practicalInfo.pickupMapLink && (
                        <>
                          <div className="aspect-video w-full rounded-xl overflow-hidden">
                            <EmbeddedMap mapUrl={excursion.practicalInfo.pickupMapLink} origin="Sweet Home Punta Cana" mode="walking" zoom={15} />
                          </div>
                          <a href={excursion.practicalInfo.pickupMapLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            Open in Google Maps <ExternalLink className="h-4 w-4" />
                          </a>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <Card className="bg-shpc-sand/50 border-none">
                  <CardHeader className="flex-row items-center gap-4">
                    <Sun className="h-8 w-8 text-shpc-yellow" />
                    <CardTitle className="text-lg">Departure</CardTitle>
                  </CardHeader>
                  <CardContent>{excursion.practicalInfo.departure}</CardContent>
                </Card>
                <Card className="bg-shpc-sand/50 border-none">
                  <CardHeader className="flex-row items-center gap-4">
                    <Clock className="h-8 w-8 text-shpc-yellow" />
                    <CardTitle className="text-lg">Duration</CardTitle>
                  </CardHeader>
                  <CardContent>{excursion.practicalInfo.duration}</CardContent>
                </Card>
                <div className="md:col-span-2">
                  <Card className="bg-shpc-sand/50 border-none">
                    <CardHeader className="flex-row items-center gap-4">
                      <Info className="h-8 w-8 text-shpc-yellow" />
                      <CardTitle className="text-lg">Good to Know</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {excursion.practicalInfo.notes.map(note => <li key={note}>{note}</li>)}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Gallery */}
            <section>
              <h2 className="text-3xl font-bold text-shpc-ink mb-6">Gallery</h2>
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
                        className="rounded-2xl object-cover aspect-video"
                        data-ai-hint="vacation excursion"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </section>
            
            <section>
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
            </section>
          </div>
          
          {/* Booking Widget */}
          <aside className="row-start-1 lg:row-auto">
             <Card className="shadow-soft rounded-2xl sticky top-24">
                <CardHeader>
                    <CardTitle>Book Your Adventure</CardTitle>
                    <CardDescription>Select date, guests, and bundle options.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <BookingForm
                      mainExcursion={{...excursion, ...mainExcursionState}}
                      onMainExcursionChange={setMainExcursionState}
                      bundledItems={bundledAsArray}
                      onBundledItemChange={handleBundledItemChange}
                      onRemoveBundledItem={(id) => handleToggleBundle({ id } as Excursion)}
                      isBookable={isBookable}
                    />
                </CardContent>
            </Card>
          </aside>

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
      bundledItems: bundledItems.map(item => ({...item, bookingDate: item.bookingDate?.toISOString()})),
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
    <div className="space-y-4">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Image src={mainExcursion.image} alt={mainExcursion.title} width={80} height={60} className="rounded-lg object-cover aspect-video" data-ai-hint="vacation excursion" />
            <p className="font-semibold">{mainExcursion.title}</p>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <Label className="font-medium text-xs">Date</Label>
              <Popover open={mainCalendarOpen} onOpenChange={setMainCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant={'outline'} className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {mainExcursionDate ? format(mainExcursionDate, 'PPP') : <span>Pick a date</span>}
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
            <div className="space-y-4">
              <GuestCounter 
                label="Adults"
                count={mainExcursion.adults}
                onCountChange={(count) => onMainExcursionChange({ ...mainExcursion, adults: count })}
                price={mainExcursion.price.adult}
                min={1}
              />
            </div>
          </div>
        </div>

        {bundledItems.length > 0 && <Separator />}

        {bundledItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 flex-grow">
                      <Image src={item.image} alt={item.title} width={80} height={60} className="rounded-lg object-cover aspect-video" data-ai-hint="vacation excursion" />
                      <p className="font-semibold flex-grow">{item.title} (Bundled)</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => onRemoveBundledItem(item.id)}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                    </Button>
                </div>
                 <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-4">
                    <div className="space-y-2">
                        <Label className="font-medium text-xs">Date</Label>
                        <Popover open={bundleCalendarOpen[item.id] || false} onOpenChange={(isOpen) => setBundleCalendarOpen(prev => ({...prev, [item.id]: isOpen}))}>
                        <PopoverTrigger asChild>
                            <Button variant={'outline'} className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {item.bookingDate ? format(item.bookingDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={item.bookingDate}
                            onSelect={(date) => {
                              onBundledItemChange(item.id, { bookingDate: date });
                              setBundleCalendarOpen(prev => ({...prev, [item.id]: false}));
                            }}
                            initialFocus
                            disabled={(date) => {
                                const now = new Date();
                                const isAfter6PM = now.getHours() >= 18;
                                const earliestDate = addDays(new Date(), isAfter6PM ? 2 : 1);
                                earliestDate.setHours(0,0,0,0);

                                if (!date) return true;

                                const isBeforeEarliest = date < earliestDate;
                                const isMainDate = mainExcursionDate ? isSameDay(date, mainExcursionDate) : false;
                                return isBeforeEarliest || isMainDate;
                            }}
                            />
                        </PopoverContent>
                        </Popover>
                         {mainExcursionDate && item.bookingDate && isSameDay(mainExcursionDate, item.bookingDate) && (
                          <p className="text-destructive text-xs">Bundled excursions cannot be on the same day.</p>
                        )}
                    </div>
                     <div className="space-y-4">
                        <GuestCounter 
                            label="Adults"
                            count={item.adults}
                            onCountChange={(count) => onBundledItemChange(item.id, { adults: count })}
                            price={item.price.adult}
                            min={1}
                        />
                    </div>
                 </div>
              </div>
              {index < bundledItems.length - 1 && <Separator />}
            </React.Fragment>
        ))}

        <Separator/>

        <div className="p-6 space-y-4">
          <p className="font-semibold">Summary</p>
          <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex justify-between">
                  <span>{mainExcursion.title} ({mainExcursion.adults} Adults)</span>
                  <span>${getPriceForItem({ price: mainExcursion.price, adults: mainExcursion.adults }).toFixed(2)}</span>
              </div>
                {bundledItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center group">
                      <span className="flex-1 pr-2">{item.title} ({item.adults} Adults)</span>
                      <span className="text-right">${getPriceForItem(item).toFixed(2)}</span>
                  </div>
              ))}
          </div>
          {bundleDiscount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 font-medium pt-2">
                  <span className="flex items-center gap-1"><Tag className="h-4 w-4"/>Bundle Savings (10%)</span>
                  <span>-${bundleDiscount.toFixed(2)}</span>
              </div>
          )}
          <Separator />
           <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-2xl">${totalPrice.toFixed(2)}</span>
          </div>
          <p className="text-xs text-green-600 font-medium flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5"/>Taxes and fees included, no hidden fees.</p>

          <Button size="lg" className="w-full bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90" disabled={!isBookable} onClick={handleBookNow}>
            {isBookable ? 'Book Now' : 'Complete selections'}
          </Button>
          {!isBookable && (
            <p className="text-xs text-center text-muted-foreground">Please select a date for all excursions to continue.</p>
          )}
        </div>
    </div>
  );
}

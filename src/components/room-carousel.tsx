
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Room } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomCarouselProps {
  rooms: Room[];
}

export default function RoomCarousel({ rooms }: RoomCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }
 
    setCurrent(api.selectedScrollSnap())
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <div className="relative w-full">
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
          align: 'center',
        }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-4 md:-ml-6 lg:-ml-8">
          {rooms.map((room, index) => (
            <CarouselItem key={room.id} className="pl-4 md:pl-6 lg:pl-8 basis-full md:basis-4/5 lg:basis-[90vw] max-w-[1200px]">
                <Link href={`/rooms/${room.slug}`} className="block group">
                  <div className={cn(
                      "relative aspect-video w-full bg-shpc-ink rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 ease-in-out shadow-lg",
                  )}>
                    <Image
                      src={room.image}
                      alt={room.name}
                      fill
                      className="object-cover transition-all duration-300 opacity-80 group-hover:scale-105 group-hover:opacity-100"
                      data-ai-hint="hotel room beach"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                        <h3 className="font-playfair text-3xl md:text-4xl font-bold">
                          {room.name}
                        </h3>
                        <p className="mt-2 text-sm text-white/90">
                           {room.rating?.review || `From $${room.price}/night`}
                        </p>
                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button asChild size="sm" variant="secondary" className="bg-white/90 text-shpc-ink hover:bg-white rounded-full">
                                <span>
                                    View Room <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                </span>
                            </Button>
                        </div>
                    </div>
                  </div>
                </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
       <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
          {rooms.map((_, index) => (
              <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                      "h-1.5 w-6 rounded-full transition-all",
                      current === index ? "bg-shpc-ink" : "bg-shpc-ink/20"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
              />
          ))}
      </div>
    </div>
  );
}

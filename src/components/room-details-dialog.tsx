
'use client';

import * as React from 'react';
import Image from 'next/image';
import type { Room } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  BedDouble,
  Users,
  AirVent,
  Wifi,
  Sparkles,
  Bath,
  CupSoda,
  Tv,
  ParkingCircle,
  ShieldCheck,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface RoomDetailsDialogProps {
  room: Room;
  children: React.ReactNode;
  nights?: number;
}

const amenityCategories = {
  bedroom: {
    label: 'Bedroom',
    icon: <BedDouble className="h-5 w-5" />,
    items: ['Premium bedding', 'Closet/wardrobe', 'Air Conditioning'],
  },
  bathroom: {
    label: 'Bathroom',
    icon: <Bath className="h-5 w-5" />,
    items: ['Private bathroom', 'Hot water', 'Towels', 'Toiletries'],
  },
  internet: {
    label: 'Internet & Tech',
    icon: <Tv className="h-5 w-5" />,
    items: ['Free Wi-Fi', 'Netflix', 'Smart TV'],
  },
  more: {
    label: 'More',
    icon: <Sparkles className="h-5 w-5" />,
    items: ['Non-smoking', 'Private Balcony'],
  },
};

export default function RoomDetailsDialog({ room, children, nights }: RoomDetailsDialogProps) {
  const searchParams = useSearchParams();
  const bookingParams = new URLSearchParams(searchParams.toString());
  const roomUrl = `/rooms/${room.slug}?${bookingParams.toString()}`;
  const totalPrice = nights && nights > 0 ? room.price * nights : room.price;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl p-0">
        <div className="flex flex-col">
          <div className="relative h-64 md:h-80 w-full">
            <Image
              src={room.image}
              alt={room.name}
              fill
              className="object-cover rounded-t-lg"
              data-ai-hint="hotel room"
            />
          </div>
          <div className="flex flex-col">
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-400px)]">
              <DialogHeader>
                <DialogTitle className="text-2xl">{room.name}</DialogTitle>
              </DialogHeader>

              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary" className="gap-1.5 pl-1.5"><Users className="h-4 w-4" /> Sleeps {room.capacity}</Badge>
                <Badge variant="secondary" className="gap-1.5 pl-1.5"><AirVent className="h-4 w-4" /> A/C</Badge>
                <Badge variant="secondary" className="gap-1.5 pl-1.5"><Wifi className="h-4 w-4" /> Free WiFi</Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Space Details</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>1 bedroom, 1 private bathroom</li>
                  <li>{room.bedding} Bed</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Amenities</h4>
                <div className="space-y-4">
                  {Object.values(amenityCategories).map(category => (
                    <div key={category.label}>
                      <h5 className="flex items-center gap-2 font-medium text-sm mb-2">
                        {category.icon}
                        <span>{category.label}</span>
                      </h5>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {category.items.map(item => {
                          const hasAmenity = room.amenities.some(a => a.toLowerCase().includes(item.toLowerCase()));
                          if (hasAmenity) {
                            return (
                              <li key={item} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Check className="h-3.5 w-3.5 text-green-600"/>
                                {item}
                              </li>
                            );
                          }
                          return null;
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 bg-muted/50 mt-auto rounded-b-lg">
              <div className="w-full space-y-3">
                 <div className="flex justify-between items-center">
                    {nights && nights > 0 ? (
                       <div>
                         <p className="font-bold text-shpc-ink text-xl">${totalPrice.toFixed(2)} total</p>
                         <p className="text-xs text-muted-foreground">for {nights} {nights === 1 ? 'night' : 'nights'}, taxes included</p>
                       </div>
                    ) : (
                       <div>
                          <span className="text-sm text-muted-foreground">From </span>
                          <span className="text-xl font-bold text-foreground">${room.price}</span>
                          <span className="text-sm text-muted-foreground">/night</span>
                      </div>
                    )}
                 </div>
                 <Button asChild size="lg" className="w-full">
                    <Link href={roomUrl}>
                        Book This Room <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                {room.cancellationPolicy && (
                    <p className="text-xs text-muted-foreground text-center">{room.cancellationPolicy}</p>
                )}
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

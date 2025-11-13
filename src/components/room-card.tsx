
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Room } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Users, BedDouble, ArrowRight, Wifi, AirVent, Check, CheckCircle, Bath, Tv, Wind, Home } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface RoomCardProps {
  room: Room;
  onSelect?: () => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  linkToPage?: boolean;
  isDisabled?: boolean;
  nights?: number;
}

export default function RoomCard({ room, onSelect, isSelected, isSelectionMode = false, linkToPage = false, isDisabled = false, nights }: RoomCardProps) {
  const handleSelectClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.();
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (linkToPage && !isSelectionMode) {
      return <Link href={`/rooms/${room.slug}`} className="block h-full">{children}</Link>
    }
    return <>{children}</>;
  }

  const hasBalcony = room.amenities.some(a => a.toLowerCase().includes('balcony'));
  const hasTerrace = room.amenities.some(a => a.toLowerCase().includes('patio access'));
  const hasTv = room.amenities.some(a => a.toLowerCase().includes('tv'));


  const cardContent = (
    <Card className={cn(
      "overflow-hidden shadow-soft rounded-2xl w-full flex flex-col group h-full transition-all duration-300", 
      isSelected ? "ring-2 ring-primary ring-offset-2" : "",
      isDisabled ? "opacity-50 cursor-not-allowed" : ""
    )}>
       <div className="block overflow-hidden relative aspect-video w-full">
        <Image
          src={room.image || 'https://picsum.photos/seed/room-placeholder/800/600'}
          alt={`View of ${room.name}`}
          fill
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          data-ai-hint="hotel room beach"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 p-6 text-white space-y-3">
          <h3 className="font-bold text-2xl">{room.name}</h3>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-left">
            <p className="text-sm text-white/90">{room.rating?.review || 'A comfortable and stylish room.'}</p>
        </div>
       </div>
      {isSelectionMode && (
        <div className="p-4 bg-background mt-auto">
            {nights && nights > 0 && (
                <div className="mb-4 text-center">
                    <p className="text-2xl font-bold">${(room.price * nights).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">for {nights} {nights === 1 ? 'night' : 'nights'}</p>
                </div>
            )}
          <Button size="lg" onClick={handleSelectClick} className="w-full" disabled={isDisabled}>
            {isSelected ? <><Check className="mr-2 h-4 w-4" /> Added</> : 'Add Room'}
          </Button>
           <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="text-center text-sm block text-muted-foreground hover:underline p-2 w-full justify-center">
                    View details
                </AccordionTrigger>
                <AccordionContent className="p-2 text-left">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="font-semibold text-foreground flex items-center gap-2"><BedDouble className="h-4 w-4 text-muted-foreground"/> {room.bedding} Bed</div>
                    <div className="font-semibold text-foreground flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground"/> Sleeps {room.capacity}</div>
                    <div className="font-semibold text-foreground flex items-center gap-2"><Bath className="h-4 w-4 text-muted-foreground"/> Private Bathroom</div>
                    <div className="font-semibold text-foreground flex items-center gap-2"><Wifi className="h-4 w-4 text-muted-foreground"/> Free Wi-Fi</div>
                    <div className="font-semibold text-foreground flex items-center gap-2"><AirVent className="h-4 w-4 text-muted-foreground"/> A/C</div>
                    {hasBalcony && <div className="font-semibold text-foreground flex items-center gap-2"><Wind className="h-4 w-4 text-muted-foreground"/> Balcony</div>}
                    {hasTerrace && <div className="font-semibold text-foreground flex items-center gap-2"><Home className="h-4 w-4 text-muted-foreground"/> Terrace</div>}
                    {hasTv && <div className="font-semibold text-foreground flex items-center gap-2"><Tv className="h-4 w-4 text-muted-foreground"/> Smart TV</div>}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
        </div>
      )}
    </Card>
  );

  return <CardWrapper>{cardContent}</CardWrapper>;
}

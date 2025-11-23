'use client';

import * as React from 'react';
import { addDays, format, differenceInDays } from 'date-fns';
import { Calendar as CalendarIcon, Users, ArrowRight, Plus, Minus, Loader2, CircleX, CircleCheck } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { checkRoomAvailability } from '@/server-actions/booking'; // Assuming this action is created
import { Room } from '@/lib/types';

interface BookingWidgetProps {
  room: Room;
}

// This is now a single, clean client component. No more wrapper.
export default function BookingWidget({ room }: BookingWidgetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for user inputs
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    return from && to ? { from: new Date(from), to: new Date(to) } : undefined;
  });
  const [guests, setGuests] = React.useState(() => {
    const guestsParam = searchParams.get('guests');
    return guestsParam ? Math.min(Number(guestsParam), room.capacity) : 1;
  });

  // State for the booking process
  const [isLoading, setIsLoading] = React.useState(false);
  const [availability, setAvailability] = React.useState<'available' | 'booked' | 'error' | null>(null);
  const [totalPrice, setTotalPrice] = React.useState<number | null>(null);

  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);

  // This function is the new core logic
  const handleCheckAvailability = async () => {
    if (!date?.from || !date?.to) return;
    setIsLoading(true);
    setAvailability(null);

    try {
      const nights = differenceInDays(date.to, date.from);
      if (nights <= 0) {
        setAvailability('error');
        return;
      }
      
      // This is a call to a server action for secure checking
      const result = await checkRoomAvailability(room.id, date.from, date.to);

      if (result.available) {
        setAvailability('available');
        const price = nights * room.price; // Simplified pricing
        setTotalPrice(price);
      } else {
        setAvailability('booked');
        setTotalPrice(null);
      }
    } catch (error) {
      console.error("Failed to check availability:", error);
      setAvailability('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!date?.from || !date?.to || !totalPrice) return;

    const params = new URLSearchParams();
    params.set('roomId', room.id);
    params.set('from', format(date.from, 'yyyy-MM-dd'));
    params.set('to', format(date.to, 'yyyy-MM-dd'));
    params.set('guests', String(guests));
    params.set('price', String(totalPrice));

    router.push(`/checkout?${params.toString()}`);
  };
  
  // Reset availability state if dates change
  React.useEffect(() => {
      setAvailability(null);
      setTotalPrice(null);
  }, [date, guests]);


  const getDisabledDays = () => {
    // In a real app, this would also fetch booked dates
    return [{ before: new Date() }];
  }

  const nights = date?.from && date?.to ? differenceInDays(date.to, date.from) : 0;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
        {/* Date and Guest Pickers */}
        <div className="grid grid-cols-1 gap-2">
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                    <Button id="date" variant={'outline'} className={cn('w-full justify-start text-left font-normal h-12', !date && 'text-muted-foreground')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? `${format(date.from, 'LLL dd, y')} - ${format(date.to, 'LLL dd, y')}` : format(date.from, 'LLL dd, y')
                        ) : ( <span>Select dates</span> )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        disabled={getDisabledDays()}
                    />
                </PopoverContent>
            </Popover>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant={'outline'} className="w-full justify-start text-left font-normal h-12">
                        <Users className="mr-2 h-4 w-4" />
                        <span>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="icon" onClick={() => setGuests(Math.max(1, guests - 1))}><Minus className="h-4 w-4" /></Button>
                        <span>{guests}</span>
                        <Button variant="ghost" size="icon" onClick={() => setGuests(Math.min(room.capacity, guests + 1))}><Plus className="h-4 w-4" /></Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>

        {/* Dynamic Action Button */}
        {availability === 'available' ? (
            <Button size="lg" className="w-full h-12 text-base font-semibold" onClick={handleProceedToCheckout}>
                Book Now
            </Button>
        ) : (
            <Button size="lg" className="w-full h-12 text-base font-semibold" onClick={handleCheckAvailability} disabled={!date?.from || !date?.to || isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Check Availability
            </Button>
        )}

        {/* Availability & Price Display */}
        <div className="text-center min-h-[60px] flex flex-col justify-center">
            {isLoading && <p className="text-sm text-muted-foreground">Checking...</p>}
            {availability === 'available' && totalPrice !== null && (
                <div className='text-green-600 font-semibold flex items-center justify-center gap-2'>
                    <CircleCheck className='h-5 w-5'/> 
                    <div>
                        <p>This room is available!</p>
                        <p className='text-lg'>Total: ${totalPrice.toFixed(2)} for {nights} {nights === 1 ? 'night' : 'nights'}</p>
                    </div>
                </div>
            )}
            {availability === 'booked' && (
                <p className="text-sm text-red-500 font-semibold flex items-center justify-center gap-2"><CircleX className='h-5 w-5'/> Sorry, this room is booked for these dates.</p>
            )}
            {availability === 'error' && (
                 <p className="text-sm text-red-500 font-semibold flex items-center justify-center gap-2"><CircleX className='h-5 w-5'/> Please select a valid date range.</p>
            )}
        </div>
    </div>
  );
}

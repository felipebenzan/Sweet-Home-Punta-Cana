
'use client';

import * as React from 'react';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon, Users, ArrowRight, Plus, Minus } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useRouter, useSearchParams } from 'next/navigation';


import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from './ui/skeleton';

interface DateSearchProps {
  roomSlug?: string;
}

function DateSearchComponent({ roomSlug }: DateSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from && to) {
      return { from: new Date(from), to: new Date(to) };
    }
    return undefined;
  });
  const [guests, setGuests] = React.useState(() => {
    const guestsParam = searchParams.get('guests');
    return guestsParam ? Number(guestsParam) : 2;
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);

  const handleSearch = () => {
    if (!date?.from || !date?.to) return;
    
    const params = new URLSearchParams();
    params.set('from', format(date.from, 'yyyy-MM-dd'));
    params.set('to', format(date.to, 'yyyy-MM-dd'));
    params.set('guests', String(guests));

    if (roomSlug) {
      params.set('room', roomSlug);
    }
    
    router.push(`/search?${params.toString()}`);
  };

  const handleDateSelect = (selectedRange: DateRange | undefined) => {
    if (selectedRange) {
      if (selectedRange.from && !selectedRange.to) {
        setDate({ from: selectedRange.from, to: addDays(selectedRange.from, 1) });
      } else {
        setDate(selectedRange);
      }

      if (selectedRange.from && selectedRange.to) {
        setIsDatePickerOpen(false);
      }
    } else {
      setDate(undefined);
    }
  };
  
  const getDisabledDays = () => {
    const today = new Date();
    const now = new Date();
    
    if (now.getHours() >= 19) {
        return [{ before: addDays(today, 1) }];
    }

    return [{ before: today }];
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2">
      <div className="grid grid-cols-2 md:col-span-8 md:grid-cols-8 gap-2">
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={'ghost'}
              className={cn(
                'w-full justify-start text-left font-normal h-12 text-base col-span-1 md:col-span-5',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-5 w-5" />
              <div>
                <p className="text-xs font-semibold text-neutral-500">Dates</p>
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(date.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick dates</span>
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              disabled={getDisabledDays()}
            />
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
               <Button
                  variant={'ghost'}
                  className="w-full justify-start text-left font-normal h-12 text-base col-span-1 md:col-span-3"
                >
                   <Users className="mr-2 h-5 w-5" />
                   <div>
                      <p className="text-xs font-semibold text-neutral-500">Guests</p>
                      <span className="font-normal text-base w-20 inline-block">{guests} {guests === 1 ? 'adult' : 'adults'}</span>
                  </div>
              </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
              <div className="flex items-center justify-between p-1 rounded-lg bg-background">
                  <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  >
                  <Minus className="h-4 w-4" />
                  </Button>
                  <div className="text-center mx-2">
                      <p className="text-xs font-semibold text-neutral-500">Guests</p>
                      <span className="font-normal text-base w-20 inline-block">{guests} {guests === 1 ? 'adult' : 'adults'}</span>
                  </div>
                  <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setGuests(Math.min(8, guests + 1))}
                  >
                  <Plus className="h-4 w-4" />
                  </Button>
              </div>
          </PopoverContent>
        </Popover>
      </div>

      <Button size="lg" className="h-12 w-full col-span-1 md:col-span-4 rounded-xl bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 text-base font-medium" onClick={handleSearch} disabled={!date?.from || !date?.to}>
        Check Availability <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}

export default function DateSearch({ roomSlug }: DateSearchProps) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <Skeleton className="h-12 w-full" />;
  }

  return <DateSearchComponent roomSlug={roomSlug} />;
}

"use client";

import * as React from "react";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon, Search, Users, Minus, Plus } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateSearchProps {
  className?: string;
  roomSlug?: string;
}

export default function DateSearch({ className, roomSlug }: DateSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    const from = searchParams.get("arrival");
    const to = searchParams.get("departure");
    if (from && to) {
      // Parse YYYY-MM-DD as local start of day to avoid timezone shifts
      const parseDate = (str: string) => {
        const parts = str.split('-');
        if (parts.length === 3) {
          return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
        return new Date(str);
      };
      return {
        from: parseDate(from),
        to: parseDate(to),
      };
    }
    return undefined;
  });

  const [guests, setGuests] = React.useState(() => {
    const g = searchParams.get("numAdults");
    return g ? parseInt(g) : 1;
  });

  const handleSearch = () => {
    if (!date?.from || !date?.to) return;

    const params = new URLSearchParams();
    params.set("arrival", format(date.from, "yyyy-MM-dd"));
    params.set("departure", format(date.to, "yyyy-MM-dd"));
    params.set("numAdults", guests.toString());

    if (roomSlug) {
      params.set("room", roomSlug);
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal h-12",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Check-in - Check-out</span>
              )}
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
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
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
              <Button variant="ghost" size="icon" onClick={() => setGuests(Math.min(8, guests + 1))}><Plus className="h-4 w-4" /></Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Button
        className="w-full h-12 text-base font-semibold bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90"
        onClick={handleSearch}
        disabled={!date?.from || !date?.to}
      >
        <Search className="mr-2 h-4 w-4" />
        Search Availability
      </Button>
    </div>
  );
}

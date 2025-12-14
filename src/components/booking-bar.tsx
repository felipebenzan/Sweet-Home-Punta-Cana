'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Users, Minus, Plus } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function BookingBar() {
    const barRef = React.useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    // Form State
    const [date, setDate] = React.useState<DateRange | undefined>(() => {
        const arrival = searchParams?.get('arrival');
        const departure = searchParams?.get('departure');
        if (arrival && departure) {
            // Parse YYYY-MM-DD as local start of day to avoid timezone shifts
            const parseDate = (str: string) => {
                const parts = str.split('-');
                if (parts.length === 3) {
                    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                }
                return new Date(str);
            };
            return {
                from: parseDate(arrival),
                to: parseDate(departure)
            };
        }
        return undefined;
    });

    const [guests, setGuests] = React.useState(() => {
        const g = searchParams?.get('numAdults');
        return g ? parseInt(g) : 2;
    });

    // Direct DOM manipulation for sticky styling to avoid re-renders
    React.useEffect(() => {
        const bar = barRef.current;
        if (!bar) return;

        const handleScroll = () => {
            const threshold = window.innerHeight * 0.7;
            const isStuck = window.scrollY > threshold;

            if (isStuck) {
                bar.classList.add('shadow-md', 'border-b', 'border-neutral-200');
                bar.classList.remove('border-t', 'border-neutral-100');
            } else {
                bar.classList.remove('shadow-md', 'border-b', 'border-neutral-200');
                bar.classList.add('border-t', 'border-b', 'border-neutral-100');
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check on mount
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = () => {
        if (!date?.from || !date?.to) return;

        const params = new URLSearchParams();
        params.set('arrival', format(date.from, 'yyyy-MM-dd'));
        params.set('departure', format(date.to, 'yyyy-MM-dd'));
        params.set('numAdults', guests.toString());

        router.push(`/search?${params.toString()}`);
    };

    return (
        <div
            ref={barRef}
            className={cn(
                "w-full bg-white/95 backdrop-blur-sm transition-all duration-300 ease-in-out z-[900]",
                "sticky",
                "border-t border-b border-neutral-100", // Default state
                "py-3"
            )}
            style={{
                top: 'var(--header-offset, 64px)',
            }}
        >
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-[1.3fr_1fr_1fr] md:flex md:flex-row items-center gap-2 md:gap-4 md:justify-center">

                    {/* Date Picker */}
                    <div className="w-full md:w-auto flex-1 md:max-w-sm">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-12 px-3 md:px-4 overflow-hidden",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate text-xs md:text-sm">
                                        {date?.from ? (
                                            date.to ? (
                                                <>
                                                    {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
                                                </>
                                            ) : (
                                                format(date.from, "MMM dd")
                                            )
                                        ) : (
                                            <span>Select Dates</span>
                                        )}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
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

                    {/* Guests Input */}
                    <div className="w-auto md:w-[200px]">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={'outline'} className="w-full justify-center md:justify-start text-left font-normal h-12 px-3 md:px-4">
                                    <Users className="h-4 w-4 md:mr-2" />
                                    <span className="ml-1 text-xs md:text-sm truncate">
                                        {guests} {guests === 1 ? 'Guest' : 'Guests'}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 pointer-events-auto">
                                <div className="flex items-center justify-between">
                                    <Button variant="ghost" size="icon" onClick={() => setGuests(Math.max(1, guests - 1))}><Minus className="h-4 w-4" /></Button>
                                    <span>{guests}</span>
                                    <Button variant="ghost" size="icon" onClick={() => setGuests(Math.min(8, guests + 1))}><Plus className="h-4 w-4" /></Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Submit Button */}
                    <div className="w-auto md:w-auto">
                        <Button
                            className="w-full bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 font-semibold h-12 px-4 md:px-8"
                            onClick={handleSearch}
                        >
                            <span className="hidden md:inline">Check Availability</span>
                            <span className="md:hidden">Check</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

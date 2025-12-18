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

interface BookingBarProps {
    variant?: 'horizontal' | 'vertical';
    roomSlug?: string;
    disableSticky?: boolean;
    className?: string;
}

export default function BookingBar({
    variant = 'horizontal',
    roomSlug,
    disableSticky = false,
    className
}: BookingBarProps) {
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
        if (disableSticky) return;

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
    }, [disableSticky]);

    const handleSearch = () => {
        if (!date?.from || !date?.to) return;

        const params = new URLSearchParams();
        params.set('arrival', format(date.from, 'yyyy-MM-dd'));
        params.set('departure', format(date.to, 'yyyy-MM-dd'));
        params.set('numAdults', guests.toString());

        if (roomSlug) {
            params.set('room', roomSlug);
        }

        router.push(`/search?${params.toString()}`);
    };

    const isVertical = variant === 'vertical';

    return (
        <div
            ref={barRef}
            className={cn(
                "w-full transition-all duration-300 ease-in-out z-[900]",
                !disableSticky && "bg-white/95 backdrop-blur-sm sticky border-t border-b border-neutral-100 py-3",
                disableSticky && "static bg-transparent",
                className
            )}
            style={{
                top: !disableSticky ? 'var(--header-offset, 64px)' : 'auto',
            }}
        >
            <div className={cn(
                !isVertical && "max-w-6xl mx-auto px-6",
                isVertical && "w-full"
            )}>
                <div className={cn(
                    !isVertical && "grid grid-cols-[1.3fr_1fr_1fr] md:flex md:flex-row items-center gap-2 md:gap-4 md:justify-center",
                    isVertical && "flex flex-col gap-4"
                )}>

                    {/* Date Picker */}
                    <div className={cn("w-full", !isVertical && "md:w-auto flex-1 md:max-w-sm")}>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-12 px-3 md:px-4 overflow-hidden",
                                        !date && "text-muted-foreground",
                                        isVertical && "bg-background"
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
                    <div className={cn("w-full", !isVertical && "w-auto md:w-[200px]")}>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={'outline'} className={cn(
                                    "w-full justify-start text-left font-normal h-12 px-3 md:px-4",
                                    !isVertical && "justify-center md:justify-start",
                                    isVertical && "bg-background"
                                )}>
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
                    <div className={cn("w-full", !isVertical && "w-auto md:w-auto")}>
                        <Button
                            className={cn(
                                "w-full bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 font-semibold h-12 px-4 md:px-8",
                                isVertical && "text-base"
                            )}
                            onClick={handleSearch}
                        >
                            <span className={cn(!isVertical && "hidden md:inline")}>Book Now!</span>
                            <span className={cn(!isVertical && "md:hidden", isVertical && "hidden")}>Search</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

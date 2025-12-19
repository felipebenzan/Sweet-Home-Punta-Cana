'use client';
import * as React from 'react';
import { useScrollDirection } from '@/hooks/use-scroll-direction'; // Import hook
import {
    Calendar as CalendarIcon,
    Users,
    Plus,
    Minus,
    Loader2,
    ArrowRight,
    ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/use-cart-store';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ExcursionBookingWidgetProps {
    id: string;
    title: string;
    basePrice: number;
    imageUrl: string;
}

export function ExcursionBookingWidget({
    id,
    title,
    basePrice,
    imageUrl,
}: ExcursionBookingWidgetProps) {
    const { toast } = useToast();
    const addItem = useCartStore((state) => state.addItem);
    const scrollDirection = useScrollDirection(); // Use hook

    // Form State
    const [date, setDate] = React.useState<Date | undefined>();
    const [adults, setAdults] = React.useState(2);
    const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);
    const [isMobileDateExpanded, setIsMobileDateExpanded] = React.useState(false);
    const [isAdded, setIsAdded] = React.useState(false);

    // Derived State
    const totalPrice = adults * basePrice;
    const isReadyToAdd = !!date;

    const handleAddToCart = () => {
        if (!date) return;

        addItem({
            id: `${id}-${date.toISOString()}`, // Simple unique ID generation
            excursionId: id,
            title,
            image: imageUrl,
            date: date.toISOString(),
            passengers: {
                adults,
                children: 0,
            },
            pricePerAdult: basePrice,
            pricePerChild: 0,
            totalPrice,
            type: 'excursion',
        });

        toast({
            title: "Added to Cart",
            description: `${title} has been added to your itinerary.`,
        });

        setIsAdded(true);
        // Drawer stays open to show confirmation buttons
    };

    const getDisabledDays = () => {
        const now = new Date();
        // If it's 6 PM or later, disable today and tomorrow.
        const cutoffHour = 18;
        if (now.getHours() >= cutoffHour) {
            return { before: addDays(new Date(), 2) };
        }
        return { before: addDays(new Date(), 1) };
    };

    // Shared Form Content (used in both Desktop Card and Mobile Drawer)
    const BookingFormContent = ({ inlineCalendar = false }) => (
        <div className="space-y-6">
            {/* Header Section within Form */}
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">From</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-shpc-ink">${basePrice}</span>
                    <span className="text-sm text-neutral-500">/ person</span>
                </div>
            </div>

            <Separator />

            {/* Date Picker */}
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Date
                </label>
                {inlineCalendar ? (
                    <Collapsible
                        open={isMobileDateExpanded}
                        onOpenChange={setIsMobileDateExpanded}
                        className="w-full space-y-2"
                    >
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2">
                            <div className="rounded-md border p-3 flex justify-center bg-neutral-50">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => {
                                        setDate(d);
                                        setIsAdded(false);
                                        // Close after delay
                                        setTimeout(() => {
                                            setIsMobileDateExpanded(false);
                                        }, 300);
                                    }}
                                    disabled={getDisabledDays()}
                                    initialFocus
                                    className="rounded-md border bg-white"
                                    fromDate={new Date()} // Prevent past dates
                                />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                ) : (
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => {
                                    setDate(d);
                                    setIsCalendarOpen(false);
                                    setIsAdded(false); // Reset added state on change
                                }}
                                disabled={getDisabledDays()}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                )}
            </div>

            {/* Passengers */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Guests</p>
                        <p className="text-xs text-muted-foreground">Age 13+</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => {
                                setAdults(Math.max(1, adults - 1));
                                setIsAdded(false);
                            }}
                            disabled={adults <= 1}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-4 text-center text-sm font-medium">{adults}</span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => {
                                setAdults(adults + 1);
                                setIsAdded(false);
                            }}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">${basePrice} x {adults} Guests</span>
                    <span>${(basePrice * adults).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                </div>
            </div>

            {isAdded ? (
                <div className="space-y-3">
                    <Button
                        asChild
                        className="w-full bg-green-600 text-white hover:bg-green-700 font-bold"
                        size="lg"
                    >
                        <Link href="/checkout/excursions">
                            Go to Cart <ShoppingCart className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-shpc-ink md:hidden"
                        onClick={() => setIsMobileDrawerOpen(false)}
                    >
                        Continue Shopping
                    </Button>
                </div>
            ) : (
                <Button
                    className="w-full bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 font-bold"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!isReadyToAdd}
                >
                    Add to Itinerary
                </Button>
            )}
        </div>
    );

    return (
        <>
            {/* DESKTOP VIEW: Sticky Card */}
            <div className="hidden md:block sticky top-24">
                <Card className="shadow-lg rounded-xl border-neutral-200">
                    <CardContent className="p-6">
                        <BookingFormContent />
                    </CardContent>
                </Card>
            </div>

            {/* MOBILE VIEW: Top Bar + Drawer */}
            <div
                className={cn(
                    "md:hidden fixed left-0 right-0 z-50 bg-white border-b border-neutral-200 p-4 shadow-md transition-all duration-300",
                    scrollDirection === 'down' ? "top-0" : "top-[4.5rem]" // 4.5rem is mobile header height
                )}
            >
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">From</p>
                        <p className="text-lg font-bold text-shpc-ink">
                            ${basePrice}<span className="text-xs font-normal text-muted-foreground">/person</span>
                        </p>
                    </div>
                    <Sheet open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
                        <SheetTrigger asChild>
                            <Button size="lg" className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 font-bold px-8">
                                Reserve
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] overflow-y-auto rounded-t-xl p-6">
                            <SheetHeader className="pb-4">
                                <SheetTitle className="font-playfair text-2xl font-bold flex items-center justify-between">
                                    Book Experience
                                    {/* Close is handled by Default Sheet Close */}
                                </SheetTitle>
                            </SheetHeader>

                            <BookingFormContent inlineCalendar={true} />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </>
    );
}

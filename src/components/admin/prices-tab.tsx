"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Save, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { updateRoomBasePrice, upsertDailyRate, deleteDailyRate, getDailyRates } from "@/app/admin/rooms/actions"; // Adjust path as needed

interface PricesTabProps {
    roomId: string;
    initialBasePrice: number;
}

interface DailyRate {
    date: string; // ISO date only YYYY-MM-DD
    price: number;
}

export function PricesTab({ roomId, initialBasePrice }: PricesTabProps) {
    const [basePrice, setBasePrice] = React.useState(initialBasePrice);
    const [isSavingBase, setIsSavingBase] = React.useState(false);

    // Calendar state
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
    const [month, setMonth] = React.useState<Date>(new Date());

    // Rates cache: "YYYY-MM-DD" -> price
    const [rates, setRates] = React.useState<Record<string, number>>({});
    const [isLoadingRates, setIsLoadingRates] = React.useState(false);

    // Popover state
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [priceInput, setPriceInput] = React.useState("");
    const [isSavingRate, setIsSavingRate] = React.useState(false);

    // Fetch rates when month changes
    React.useEffect(() => {
        const fetchRates = async () => {
            setIsLoadingRates(true);
            const start = new Date(month.getFullYear(), month.getMonth() - 1, 1); // Fetch prev month too just in case
            const end = new Date(month.getFullYear(), month.getMonth() + 2, 0); // Fetch next month too

            const result = await getDailyRates(roomId, start.toISOString(), end.toISOString());

            if (result.success && result.rates) {
                const newRates: Record<string, number> = {};
                result.rates.forEach((r: any) => {
                    // Ensure we just get the YYYY-MM-DD part
                    const d = new Date(r.date).toISOString().split('T')[0];
                    newRates[d] = r.price;
                });
                setRates(prev => ({ ...prev, ...newRates }));
            }
            setIsLoadingRates(false);
        };

        fetchRates();
    }, [roomId, month]);

    const handleSaveBasePrice = async () => {
        setIsSavingBase(true);
        const result = await updateRoomBasePrice(roomId, basePrice);
        setIsSavingBase(false);

        if (result.success) {
            toast({ title: "Base Price Updated", description: "Default nightly rate saved." });
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        setSelectedDate(date);
        const dateKey = date.toISOString().split('T')[0];
        const existingPrice = rates[dateKey];
        setPriceInput(existingPrice ? existingPrice.toString() : basePrice.toString());
        setIsPopoverOpen(true);
    };

    const handleSaveDailyRate = async () => {
        if (!selectedDate) return;
        setIsSavingRate(true);

        const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const price = parseFloat(priceInput);

        if (isNaN(price)) {
            toast({ title: "Invalid Price", variant: "destructive" });
            setIsSavingRate(false);
            return;
        }

        // Upsert
        const result = await upsertDailyRate(roomId, dateStr, price);
        setIsSavingRate(false);

        if (result.success) {
            setRates(prev => ({ ...prev, [dateStr]: price }));
            toast({ title: "Rate Updated", description: `Price for ${dateStr} set to $${price}` });
            setIsPopoverOpen(false);
        } else {
            toast({ title: "Failed to save rate", variant: "destructive" });
        }
    };

    const handleDeleteDailyRate = async () => {
        if (!selectedDate) return;
        setIsSavingRate(true);
        const dateStr = selectedDate.toISOString().split('T')[0];

        const result = await deleteDailyRate(roomId, dateStr);
        setIsSavingRate(false);

        if (result.success) {
            const newRates = { ...rates };
            delete newRates[dateStr];
            setRates(newRates);
            toast({ title: "Rate Reset", description: "Date is now using base price." });
            setIsPopoverOpen(false);
        } else {
            toast({ title: "Failed to reset rate", variant: "destructive" });
        }
    };

    // Custom Day render to show prices
    const modifiers = {
        hasRate: (date: Date) => {
            const key = date.toISOString().split('T')[0];
            return key in rates;
        }
    };

    const modifiersStyles = {
        hasRate: {
            fontWeight: 'bold',
            color: '#d97706', // amber-600
            textDecoration: 'underline'
        }
    };

    return (
        <div className="space-y-6">
            {/* GLOBAL CONFIGURATION */}
            <Card className="shadow-soft rounded-2xl">
                <CardHeader>
                    <CardTitle>Global Pricing Configuration</CardTitle>
                    <CardDescription>
                        Set the default base price for this room. This allows you to manage prices internally instead of relying on Beds24.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-4">
                        <div className="space-y-2 flex-1 max-w-xs">
                            <Label htmlFor="base-price">Base Nightly Rate (USD)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                    id="base-price"
                                    type="number"
                                    className="pl-8"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(parseFloat(e.target.value))}
                                />
                            </div>
                        </div>
                        <Button onClick={handleSaveBasePrice} disabled={isSavingBase} className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90">
                            {isSavingBase ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Base Price
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* CALENDAR */}
            <Card className="shadow-soft rounded-2xl">
                <CardHeader>
                    <CardTitle>Rate Calendar</CardTitle>
                    <CardDescription>
                        Click on a date to override the base price. Dates with custom rates are highlighted.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">

                    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                            <div />
                            {/* 
                  Hidden trigger because we open programmatically on date select. 
                  Actually, Calendar integration with Popover is tricky.
                  Better approach: Wrap Calendar in a div, and put Popover anchored to something else or use a Dialog.
                  
                  Let's just put the Popover anchor around the Calendar or use a Dialog controlled by state.
                  
                  Wait, standard shadcn Popover requires a trigger. 
                  I will use a Dialog for simplicity for the edit interaction, or just position a floating card.
                  
                  Actually, let's just render the Calendar, and have a "Edit Rate" area appear below/beside it when a date is selected, 
                  OR use the Popover on a specialized "Day" component if passing components to DayPicker.
                  
                  Simpler: Just show a clean Dialog when a date is clicked.
                */}
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="space-y-4">
                                <h4 className="font-semibold leading-none">
                                    Edit Rate for {selectedDate?.toLocaleDateString()}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Set a custom price for this specific date.
                                </p>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="daily-price" className="sr-only">Price</Label>
                                    <Input
                                        id="daily-price"
                                        type="number"
                                        value={priceInput}
                                        onChange={(e) => setPriceInput(e.target.value)}
                                    />
                                    <Button size="icon" onClick={handleSaveDailyRate} disabled={isSavingRate}>
                                        {isSavingRate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    </Button>
                                    <Button size="icon" variant="destructive" onClick={handleDeleteDailyRate} disabled={isSavingRate}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Custom Calendar Implementation to visualize prices */}

                    <div className="flex flex-col md:flex-row gap-8 items-start w-full">
                        <div className="border rounded-md p-4 bg-white mx-auto">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                month={month}
                                onMonthChange={setMonth}
                                modifiers={modifiers}
                                modifiersStyles={modifiersStyles}
                                components={{
                                    DayContent: (props) => {
                                        const { date } = props;
                                        const dateKey = date.toISOString().split('T')[0];
                                        const price = rates[dateKey];

                                        return (
                                            <div className="relative w-full h-full flex flex-col items-center justify-center py-1">
                                                <span>{date.getDate()}</span>
                                                {price && (
                                                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1 rounded -mt-1">
                                                        ${price}
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    }
                                }}
                            />
                        </div>

                        {/* Editor Side Panel (Alternative to Popover/Dialog) - visible when date selected */}
                        {selectedDate && (
                            <Card className="w-full md:w-80 animate-in fade-in slide-in-from-right-4">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg">Edit Rate</CardTitle>
                                        <Button variant="ghost" size="icon" onClick={() => setSelectedDate(undefined)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <CardDescription>{format(selectedDate, 'MMMM do, yyyy')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Price for Night</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                            <Input
                                                type="number"
                                                value={priceInput}
                                                onChange={(e) => setPriceInput(e.target.value)}
                                                className="pl-8"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Button onClick={handleSaveDailyRate} disabled={isSavingRate} className="w-full">
                                            {isSavingRate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Save Rate
                                        </Button>

                                        {rates[selectedDate.toISOString().split('T')[0]] && (
                                            <Button
                                                onClick={handleDeleteDailyRate}
                                                disabled={isSavingRate}
                                                variant="outline"
                                                className="w-full text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Reset to Base Price
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}

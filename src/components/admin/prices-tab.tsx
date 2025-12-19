"use client";

import * as React from "react";
import { format, eachDayOfInterval, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Save, Trash2, X } from "lucide-react";
import { DateRange } from "react-day-picker";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateRoomBasePrice, bulkUpdateDailyRates, bulkDeleteDailyRates, getDailyRates } from "@/app/admin/rooms/actions";

interface PricesTabProps {
    roomId: string;
    initialBasePrice: number;
}

export function PricesTab({ roomId, initialBasePrice }: PricesTabProps) {
    const [basePrice, setBasePrice] = React.useState(initialBasePrice);
    const [isSavingBase, setIsSavingBase] = React.useState(false);

    // Calendar state (Range)
    const [range, setRange] = React.useState<DateRange | undefined>(undefined);
    const [month, setMonth] = React.useState<Date>(new Date());

    // Rates cache: "YYYY-MM-DD" -> price
    const [rates, setRates] = React.useState<Record<string, number>>({});
    const [isLoadingRates, setIsLoadingRates] = React.useState(false);

    // Bulk Edit State
    const [priceInput, setPriceInput] = React.useState("");
    const [isSavingRate, setIsSavingRate] = React.useState(false);

    // Fetch rates when month changes
    React.useEffect(() => {
        const fetchRates = async () => {
            setIsLoadingRates(true);
            const start = new Date(month.getFullYear(), month.getMonth() - 1, 1);
            const end = new Date(month.getFullYear(), month.getMonth() + 2, 0);

            const result = await getDailyRates(roomId, start.toISOString(), end.toISOString());

            if (result.success && result.rates) {
                const newRates: Record<string, number> = {};
                result.rates.forEach((r: any) => {
                    const d = new Date(r.date).toISOString().split('T')[0];
                    newRates[d] = r.price;
                });
                setRates(prev => ({ ...prev, ...newRates }));
            }
            setIsLoadingRates(false);
        };

        fetchRates();
    }, [roomId, month]);

    // Update price input when selection changes
    React.useEffect(() => {
        if (range?.from) {
            // Be smart: if single date or range start has a price, pre-fill it
            const key = range.from.toISOString().split('T')[0];
            const existing = rates[key];
            setPriceInput(existing?.toString() || basePrice.toString());
        }
    }, [range, rates, basePrice]);

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

    const handleSaveBulkRates = async () => {
        if (!range?.from) return;
        setIsSavingRate(true);

        const price = parseFloat(priceInput);
        if (isNaN(price)) {
            toast({ title: "Invalid Price", variant: "destructive" });
            setIsSavingRate(false);
            return;
        }

        const start = range.from;
        const end = range.to || range.from; // Handle single day selection in range mode
        const dates = eachDayOfInterval({ start, end });

        const updates = dates.map(d => ({
            date: d.toISOString().split('T')[0],
            price
        }));

        const result = await bulkUpdateDailyRates(roomId, updates);
        setIsSavingRate(false);

        if (result.success) {
            const newRates = { ...rates };
            updates.forEach(u => { newRates[u.date] = u.price; });
            setRates(newRates);
            toast({ title: "Rates Updated", description: `Updated ${updates.length} dates to $${price}` });
            setRange(undefined); // Clear selection after save
        } else {
            toast({ title: "Failed to save rates", variant: "destructive" });
        }
    };

    const handleResetRates = async () => {
        if (!range?.from) return;
        setIsSavingRate(true);

        const start = range.from;
        const end = range.to || range.from;
        const dates = eachDayOfInterval({ start, end });
        const dateStrings = dates.map(d => d.toISOString().split('T')[0]);

        const result = await bulkDeleteDailyRates(roomId, dateStrings);
        setIsSavingRate(false);

        if (result.success) {
            const newRates = { ...rates };
            dateStrings.forEach(d => { delete newRates[d]; });
            setRates(newRates);
            toast({ title: "Rates Reset", description: "Selected dates now use base price." });
            setRange(undefined);
        } else {
            toast({ title: "Failed to reset rates", variant: "destructive" });
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

            {/* CALENDAR & EDITOR */}
            <Card className="shadow-soft rounded-2xl">
                <CardHeader>
                    <CardTitle>Rate Calendar</CardTitle>
                    <CardDescription>
                        Select a date range to override prices. Existing custom rates are highlighted in amber.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Calendar Area */}
                    <div className="border rounded-md p-4 bg-white mx-auto lg:mx-0">
                        <Calendar
                            mode="range"
                            selected={range}
                            onSelect={setRange}
                            month={month}
                            onMonthChange={setMonth}
                            className="p-0"
                            classNames={{
                                month: "space-y-4",
                                cell: "h-16 w-14 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: cn(
                                    "h-16 w-14 p-0 font-normal aria-selected:opacity-100 flex flex-col items-center justify-start pt-2 gap-1 hover:bg-accent/50 transition-colors"
                                ),
                            }}
                            components={{
                                DayContent: (props) => {
                                    const { date } = props;
                                    const dateKey = date.toISOString().split('T')[0];
                                    const price = rates[dateKey];

                                    return (
                                        <>
                                            <span className="text-sm font-medium">{date.getDate()}</span>
                                            {price && (
                                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded shadow-sm">
                                                    ${price}
                                                </span>
                                            )}
                                        </>
                                    )
                                }
                            }}
                        />
                    </div>

                    {/* Editor Panel - Always visible but disabled if no selection? Or context aware. */}
                    <div className="flex-1 w-full lg:w-auto space-y-4">
                        {range?.from ? (
                            <Card className="w-full bg-muted/30 border-dashed animate-in fade-in slide-in-from-right-4">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">Edit Rates</CardTitle>
                                            <CardDescription>
                                                {format(range.from, 'MMM d')}
                                                {range.to && range.to > range.from && ` - ${format(range.to, 'MMM d, yyyy')}`}
                                            </CardDescription>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setRange(undefined)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Set Price for Selection</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                            <Input
                                                type="number"
                                                value={priceInput}
                                                onChange={(e) => setPriceInput(e.target.value)}
                                                className="pl-8 bg-white"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            This price will apply to all selected dates.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Button onClick={handleSaveBulkRates} disabled={isSavingRate} className="w-full bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90">
                                            {isSavingRate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Save Rates
                                        </Button>

                                        <Button
                                            onClick={handleResetRates}
                                            disabled={isSavingRate}
                                            variant="outline"
                                            className="w-full text-destructive hover:bg-destructive/10 border-destructive/20"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Reset to Base Price
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground bg-muted/10 min-h-[300px]">
                                <CalendarIcon className="h-10 w-10 mb-4 opacity-20" />
                                <h3 className="text-lg font-semibold mb-2">No Dates Selected</h3>
                                <p className="text-sm max-w-[240px]">
                                    Click and drag on the calendar to select a range of dates to edit.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

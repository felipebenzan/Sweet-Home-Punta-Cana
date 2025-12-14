'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Check, ArrowRight, Clock, ShoppingBag, AlertCircle, Shirt, Tag, Info, User, Mail, Phone, MapPin, CalendarIcon } from "lucide-react";
import { PayPalButtonsWrapper } from '@/components/PayPalButtonsWrapper';
import Link from 'next/link';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, isAfter, setHours, setMinutes, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

const PRICE_PER_BAG = 6;
const CURRENCY = 'USD';

export default function LaundryServicePage() {
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);



    const [currentStep, setCurrentStep] = useState(1);
    const [bags, setBags] = useState(1);
    const [pickupTime, setPickupTime] = useState('08:00');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Guest Details
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPaypal, setShowPaypal] = useState(false);

    // Scroll to top of wizard when payment mode is toggled
    useEffect(() => {
        if (showPaypal && wizardRef.current) {
            wizardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [showPaypal]);

    const total = useMemo(() => bags * PRICE_PER_BAG, [bags]);

    // Date Logic
    const isPast10Am = new Date().getHours() >= 10;
    const today = startOfDay(new Date());

    const disabledDates = (date: Date) => {
        // Disable dates before today
        if (date < today) return true;

        // If it's past 10 AM, disable today
        if (isPast10Am && date.getTime() === today.getTime()) return true;

        return false;
    };

    const validateStep1 = () => {
        if (!date) {
            toast({ title: "Missing Date", description: "Please select a service date.", variant: "destructive" });
            return false;
        }
        if (!pickupTime) {
            toast({ title: "Missing Pickup Time", description: "Please select a pickup time.", variant: "destructive" });
            return false;
        }
        return true;
    };

    const handleContinueStep1 = () => {
        if (validateStep1()) {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleProceed = () => {
        if (!guestName || !guestEmail) {
            toast({ title: "Missing Information", description: "Please provide your name and email.", variant: "destructive" });
            return;
        }
        if (!roomNumber) {
            toast({ title: "Missing Room Number", description: "Please enter your room number.", variant: "destructive" });
            return;
        }
        if (!termsAccepted) {
            toast({ title: "Terms Required", description: "Please accept the service policy.", variant: "destructive" });
            return;
        }
        setIsProcessing(true);
        setShowPaypal(true);
    };

    const onPaymentSuccess = async (paypalOrderId: string, paypalTransactionId: string) => {
        toast({ title: 'Payment Successful!', description: 'Finalizing your booking...' });

        const bookingData = {
            type: 'laundry',
            guestName: guestName,
            guestEmail: guestEmail,
            customer: { name: guestName, email: guestEmail, phone: guestPhone },
            pricing: { totalUSD: total, currency: CURRENCY },
            date: date ? format(date, 'yyyy-MM-dd') : null,
            details: {
                bags,
                pricePerBag: PRICE_PER_BAG,
                pickupTime,
                specialInstructions,
                roomNumber,
                date: date ? format(date, 'yyyy-MM-dd') : null,
            },
            totalPrice: total,
            paypalOrderId,
            paypalTransactionId,
        };

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });

            const result = await response.json();

            if (result.success) {
                toast({ title: 'Booking Confirmed!', description: 'Redirecting to confirmation page...' });
                router.push(`/confirmation/laundry-service?orderId=${result.confirmationId}`);
            } else {
                throw new Error(result.error || 'Booking failed');
            }
        } catch (error: any) {
            console.error('Booking failed:', error);
            toast({
                title: 'Booking Failed',
                description: `Payment successful but booking failed. Transaction ID: ${paypalTransactionId}`,
                variant: 'destructive',
                duration: 20000,
            });
            setIsProcessing(false);
            setShowPaypal(false);
        }
    };

    const onPaymentError = (err: any) => {
        console.error('PayPal Error:', err);
        toast({ title: 'Payment Failed', description: 'An error occurred with the PayPal transaction.', variant: 'destructive' });
        setShowPaypal(false);
        setIsProcessing(false);
    };

    const onPaymentCancel = () => {
        toast({ title: 'Payment Cancelled', description: 'You have cancelled the payment.' });
        setShowPaypal(false);
        setIsProcessing(false);
    };

    const steps = [
        { number: 1, label: "Service Details" },
        { number: 2, label: "Guest Info & Pay" }
    ];

    const wizardRef = React.useRef<HTMLDivElement>(null);
    const isFirstRender = React.useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (wizardRef.current) {
            setTimeout(() => {
                wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [currentStep]);

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <section className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <h1 className="font-playfair text-5xl md:text-6xl font-bold text-shpc-ink text-center mb-4">
                        Laundry Service | Sweet Home Punta Cana
                    </h1>
                    <p className="font-inter text-lg text-neutral-600 text-center max-w-2xl mx-auto">
                        Enjoy our professional wash & fold service
                    </p>
                </div>
            </section>

            {/* Progress Bar */}
            <section className="bg-white border-b border-neutral-200">
                <div className="max-w-3xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, idx) => (
                            <React.Fragment key={step.number}>
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                                        ${currentStep >= step.number
                                            ? 'bg-shpc-yellow text-shpc-ink'
                                            : 'bg-white border-2 border-neutral-300 text-neutral-400'
                                        }
                                    `}>
                                        {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                                    </div>
                                    <span className={`mt-2 text-xs font-inter ${currentStep >= step.number ? 'text-shpc-ink font-medium' : 'text-neutral-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`h-0.5 flex-1 mx-4 ${currentStep > step.number ? 'bg-shpc-yellow' : 'bg-neutral-300'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-12">

                    {/* Left Column - Wizard Steps */}
                    <div className="space-y-12" ref={wizardRef}>

                        {/* STEP 1: Service Details */}
                        {currentStep === 1 && (
                            <div className="bg-white rounded-lg p-6 md:p-10 shadow-sm space-y-10">
                                <h2 className="font-playfair text-3xl font-semibold text-shpc-ink">
                                    1. Service Details
                                </h2>

                                {/* Laundry Bag Note */}
                                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex items-center gap-3">
                                    <Info className="h-5 w-5 text-shpc-yellow shrink-0" />
                                    <p className="text-sm text-neutral-700 font-inter">
                                        Please use the laundry bags located inside your closet.
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Date Picker */}
                                        <div className="space-y-3">
                                            <label className="font-inter text-sm font-medium text-neutral-700 flex items-center gap-2">
                                                Service Date <span className="text-shpc-yellow">*</span>
                                            </label>
                                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal py-7 border-0 border-b border-neutral-300 rounded-none shadow-none hover:bg-transparent",
                                                            !date && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {date ? (
                                                            format(date, "PPP")
                                                        ) : (
                                                            <span>Select a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={date}
                                                        onSelect={(d) => {
                                                            setDate(d);
                                                            setIsCalendarOpen(false);
                                                        }}
                                                        disabled={disabledDates}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {isPast10Am && (
                                                <p className="text-xs text-amber-600 font-inter mt-1">
                                                    * Same-day service is unavailable after 10:00 AM.
                                                </p>
                                            )}
                                        </div>

                                        {/* Bags Dropdown */}
                                        <div className="space-y-3">
                                            <label className="font-inter text-sm font-medium text-neutral-700 flex items-center gap-2">
                                                Number of Bags <span className="text-shpc-yellow">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-500 pl-2">
                                                    <ShoppingBag className="h-5 w-5" />
                                                </div>
                                                <select
                                                    value={bags}
                                                    onChange={(e) => setBags(parseInt(e.target.value))}
                                                    className="w-full pl-10 pr-4 py-4 bg-transparent border-0 border-b border-neutral-300 focus:border-shpc-yellow focus:outline-none font-inter text-base text-shpc-ink transition-colors duration-300 appearance-none"
                                                >
                                                    <option value={1}>1 Bag</option>
                                                    <option value={2}>2 Bags</option>
                                                </select>
                                            </div>
                                            <p className="text-sm text-neutral-600 font-inter">
                                                Cost: <span className="font-semibold text-shpc-ink">${PRICE_PER_BAG}.00 per bag</span> (Wash & Fold)
                                            </p>
                                        </div>

                                        {/* Pickup Time Dropdown */}
                                        <div className="space-y-3">
                                            <label className="font-inter text-sm font-medium text-neutral-700 flex items-center gap-2">
                                                Select Pickup Time <span className="text-shpc-yellow">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-500 pl-2">
                                                    <Clock className="h-5 w-5" />
                                                </div>
                                                <select
                                                    value={pickupTime}
                                                    onChange={(e) => setPickupTime(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-4 bg-transparent border-0 border-b border-neutral-300 focus:border-shpc-yellow focus:outline-none font-inter text-base text-shpc-ink transition-colors duration-300 appearance-none"
                                                >
                                                    <option value="08:00">08:00 AM</option>
                                                    <option value="08:30">08:30 AM</option>
                                                    <option value="09:00">09:00 AM</option>
                                                    <option value="09:30">09:30 AM</option>
                                                    <option value="10:00">10:00 AM</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>



                                    {/* Recommendations */}
                                    <div className="space-y-4 pt-4 border-t border-neutral-200">
                                        <h3 className="font-inter text-lg font-semibold text-shpc-ink pb-2">
                                            Recommendations
                                        </h3>
                                        <div className="grid gap-4">
                                            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <Shirt className="h-5 w-5 text-shpc-yellow shrink-0 mt-0.5" />
                                                    <p className="text-sm text-neutral-700 font-inter">
                                                        <span className="font-semibold text-shpc-ink block mb-1">Separate by Colors</span>
                                                        We recommend separating your clothes by colors (whites/lights and darks).
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <Tag className="h-5 w-5 text-shpc-yellow shrink-0 mt-0.5" />
                                                    <p className="text-sm text-neutral-700 font-inter">
                                                        <span className="font-semibold text-shpc-ink block mb-1">Delicate Items</span>
                                                        Please leave a note if there are delicate garments. Additional charges may apply.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                </div>

                                <Button
                                    onClick={handleContinueStep1}
                                    className="w-full bg-shpc-yellow hover:bg-shpc-yellow/90 text-shpc-ink font-semibold py-7 text-base"
                                >
                                    CONTINUE
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        )}

                        {/* STEP 2: Guest Info & Pay */}
                        {currentStep === 2 && (
                            <div className="bg-white rounded-lg p-6 md:p-10 shadow-sm space-y-10">
                                <h2 className="font-playfair text-3xl font-semibold text-shpc-ink">
                                    2. Guest Information & Payment
                                </h2>

                                {!showPaypal ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <LuxuryInput
                                                icon={<User className="h-5 w-5" />}
                                                label="Full Name"
                                                value={guestName}
                                                onChange={setGuestName}
                                                placeholder="John Doe"
                                                required
                                            />
                                            <LuxuryInput
                                                icon={<Mail className="h-5 w-5" />}
                                                label="Email Address"
                                                type="email"
                                                value={guestEmail}
                                                onChange={setGuestEmail}
                                                placeholder="john@example.com"
                                                required
                                            />
                                            <LuxuryInput
                                                icon={<Phone className="h-5 w-5" />}
                                                label="Phone Number (Optional)"
                                                type="tel"
                                                value={guestPhone}
                                                onChange={setGuestPhone}
                                                placeholder="+1 (555) 000-0000"
                                            />
                                            <LuxuryInput
                                                icon={<MapPin className="h-5 w-5" />}
                                                label="Room Number"
                                                value={roomNumber}
                                                onChange={setRoomNumber}
                                                placeholder="e.g., 101"
                                                required
                                            />
                                        </div>

                                        {/* Terms */}
                                        <div className="flex items-start space-x-3 pt-4 border-t border-neutral-200">
                                            <Checkbox
                                                id="terms"
                                                checked={termsAccepted}
                                                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                                                className="mt-1"
                                            />
                                            <label htmlFor="terms" className="text-sm text-neutral-600 font-inter leading-relaxed">
                                                I accept the{' '}
                                                <Link href="/terms/laundry" target="_blank" className="text-shpc-yellow hover:text-shpc-yellow/80 underline">
                                                    Laundry Service Policy
                                                </Link>
                                                .
                                            </label>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <Button
                                                onClick={() => setCurrentStep(1)}
                                                variant="outline"
                                                className="py-7 border-neutral-300 font-semibold"
                                            >
                                                BACK
                                            </Button>
                                            <Button
                                                onClick={handleProceed}
                                                disabled={isProcessing}
                                                className="bg-shpc-yellow hover:bg-shpc-yellow/90 text-shpc-ink font-semibold py-7"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Preparing...
                                                    </>
                                                ) : (
                                                    'PAY AND BOOK NOW'
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-6">
                                        <h3 className="font-playfair text-2xl font-semibold text-center text-shpc-ink">
                                            Complete Your Secure Payment
                                        </h3>
                                        <PayPalButtonsWrapper
                                            amount={total.toString()}
                                            currency={CURRENCY}
                                            onPaymentSuccess={onPaymentSuccess}
                                            onPaymentError={onPaymentError}
                                            onPaymentCancel={onPaymentCancel}
                                        />
                                        <Button
                                            variant="outline"
                                            className="w-full border-neutral-300 py-6"
                                            onClick={onPaymentCancel}
                                            disabled={isProcessing}
                                        >
                                            Back
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Summary Sidebar - Hidden on Step 1 */}
                    {currentStep > 1 && (
                        <div className={cn("lg:sticky lg:top-24 h-fit", currentStep === 2 && "order-first lg:order-none")}>
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                {/* Header */}
                                <div className="p-6 md:p-10 border-b border-neutral-200">
                                    <h3 className="font-playfair text-2xl font-semibold text-shpc-ink uppercase tracking-wide">
                                        Service Summary
                                    </h3>
                                </div>

                                {/* Details */}
                                <div className="p-6 md:p-10 space-y-6">
                                    <div className="space-y-5">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-neutral-500 font-inter uppercase tracking-wide">Service</span>
                                            <span className="font-inter font-semibold text-shpc-ink text-right">Wash & Fold</span>
                                        </div>

                                        {date && (
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm text-neutral-500 font-inter uppercase tracking-wide">Date</span>
                                                <span className="font-inter font-semibold text-shpc-ink">{format(date, 'MMM d, yyyy')}</span>
                                            </div>
                                        )}

                                        {roomNumber && (
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm text-neutral-500 font-inter uppercase tracking-wide">Room</span>
                                                <span className="font-inter font-semibold text-shpc-ink">{roomNumber}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-neutral-500 font-inter uppercase tracking-wide">Bags</span>
                                            <span className="font-inter font-semibold text-shpc-ink">{bags}</span>
                                        </div>

                                        {pickupTime && (
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm text-neutral-500 font-inter uppercase tracking-wide">Pickup</span>
                                                <span className="font-inter font-semibold text-shpc-ink">{pickupTime}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-neutral-500 font-inter uppercase tracking-wide">Delivery</span>
                                            <span className="font-inter font-semibold text-shpc-ink">Before 5:00 PM</span>
                                        </div>
                                    </div>

                                    {/* Price Block */}
                                    <div className="bg-shpc-ink rounded-lg p-8 text-center space-y-3 mt-8">
                                        <p className="text-white/70 text-xs font-inter uppercase tracking-widest">
                                            Total Amount
                                        </p>
                                        <p className="text-white text-5xl font-bold font-playfair">
                                            ${total.toFixed(2)}
                                        </p>
                                        <p className="text-white/60 text-xs font-inter">
                                            USD · All taxes included
                                        </p>
                                    </div>

                                    {/* Inclusions */}
                                    <div className="pt-6 space-y-4">
                                        <p className="font-playfair text-base font-semibold text-shpc-ink">Included:</p>
                                        <div className="space-y-3 text-sm text-neutral-700 font-inter">
                                            <div className="flex items-center gap-3">
                                                <Check className="h-4 w-4 text-shpc-yellow shrink-0" strokeWidth={3} />
                                                <span>Professional wash & fold</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Check className="h-4 w-4 text-shpc-yellow shrink-0" strokeWidth={3} />
                                                <span>Same-day delivery</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Check className="h-4 w-4 text-shpc-yellow shrink-0" strokeWidth={3} />
                                                <span>Quality detergent & softener</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Check className="h-4 w-4 text-shpc-yellow shrink-0" strokeWidth={3} />
                                                <span>Neatly folded & packaged</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

// Luxury Input Component
function LuxuryInput({
    icon,
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    min,
    max,
    required = false
}: {
    icon: React.ReactNode;
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    min?: string;
    max?: string;
    required?: boolean;
}) {
    return (
        <div className="space-y-3">
            <label className="font-inter text-sm font-medium text-neutral-700 flex items-center gap-2">
                {label}
                {required && <span className="text-shpc-yellow">*</span>}
            </label>
            <div className="relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-500">
                    {icon}
                </div>
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    min={min}
                    max={max}
                    required={required}
                    className="
                        w-full pl-8 pr-2 py-4
                        bg-transparent
                        border-0 border-b border-neutral-300
                        focus:border-shpc-yellow focus:outline-none
                        font-inter text-base text-shpc-ink
                        placeholder:text-neutral-400
                        transition-colors duration-300
                    "
                />
            </div>
        </div>
    );
}

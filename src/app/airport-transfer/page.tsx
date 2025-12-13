'use client';

import React, { useMemo, useState, Suspense, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Plane, Info, Loader2, Users, Mail, Phone, Check, ArrowRight, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { addDays, format, parseISO } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import Link from 'next/link';
import { PayPalButtonsWrapper } from '@/components/PayPalButtonsWrapper';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const ONE_WAY_PRICE = 40;
const ROUND_TRIP_DISCOUNT = 0;
const CURRENCY = 'USD';

const DIRECTION_DETAILS = {
  arrive: { label: "Arrival", route: "From Punta Cana Airport to Sweet Home", short: "PUJ → Sweet Home" },
  depart: { label: "Departure", route: "From Sweet Home to Punta Cana Airport", short: "Sweet Home → PUJ" },
  round: { label: "Round Trip", route: "Round trip service", short: "PUJ ⇄ Sweet Home" }
}

function AirportTransferPageComponent() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaypal, setShowPaypal] = useState(false);

  const paymentContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showPaypal && paymentContainerRef.current) {
      paymentContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showPaypal]);

  const [direction, setDirection] = useState<'arrive' | 'depart' | 'round'>('arrive');
  const [passengers, setPassengers] = useState(2);
  const getTomorrow = () => addDays(new Date(), 1);
  const getToday = () => new Date();

  // Store dates as Date objects or undefined
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>(getTomorrow());
  const [departureDate, setDepartureDate] = useState<Date | undefined>(getToday());

  const [departureTime, setDepartureTime] = useState<string>("14:00");
  const [arrivalFlight, setArrivalFlight] = useState("");
  const [arrivalAirline, setArrivalAirline] = useState("");
  const [departureFlight, setDepartureFlight] = useState("");
  const [guest, setGuest] = useState({ name: "", phone: "", email: "" });
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Calendar state
  const [isArrivalCalendarOpen, setIsArrivalCalendarOpen] = useState(false);
  const [isDepartureCalendarOpen, setIsDepartureCalendarOpen] = useState(false);

  const total = useMemo(() => {
    if (direction === 'round') {
      return Math.round((ONE_WAY_PRICE * 2) * (1 - ROUND_TRIP_DISCOUNT));
    }
    return ONE_WAY_PRICE;
  }, [direction]);

  const handleArrivalDateChange = (newDate: Date | undefined) => {
    setArrivalDate(newDate);
    if (newDate && departureDate && departureDate <= newDate) {
      const nextDay = addDays(newDate, 1);
      setDepartureDate(nextDay);
    }
    setIsArrivalCalendarOpen(false);
  }

  const handleDepartureDateChange = (newDate: Date | undefined) => {
    setDepartureDate(newDate);
    setIsDepartureCalendarOpen(false);
  }

  const departureMinDate = useMemo(() => {
    if (direction === 'round' && arrivalDate) {
      return addDays(arrivalDate, 1);
    }
    return getToday();
  }, [arrivalDate, direction]);

  const validateStep1 = () => {
    const showArrival = direction === 'arrive' || direction === 'round';
    const showDeparture = direction === 'depart' || direction === 'round';

    if (showArrival && !arrivalDate) {
      toast({ title: "Missing Date", description: "Please select your arrival date.", variant: "destructive" });
      return false;
    }
    if (showDeparture && !departureDate) {
      toast({ title: "Missing Date", description: "Please select your departure date.", variant: "destructive" });
      return false;
    }

    if (showArrival && !arrivalFlight) {
      toast({ title: "Missing Flight Number", description: "Please provide your arrival flight number.", variant: "destructive" });
      return false;
    }

    if (showArrival && !arrivalAirline) {
      toast({ title: "Missing Airline", description: "Please provide your arrival airline.", variant: "destructive" });
      return false;
    }

    if (showDeparture && !departureTime) {
      toast({ title: "Missing Pickup Time", description: "Please provide your pickup time.", variant: "destructive" });
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!guest.name || !guest.email || !guest.phone) {
      toast({ title: "Missing Information", description: "Please fill all guest information fields.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleContinueStep1 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleContinueStep2 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleProceed = async () => {
    if (!termsAccepted) {
      toast({ title: "Terms Required", description: "Please accept the terms and conditions.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    const checkDate = direction === 'arrive' || direction === 'round' ? arrivalDate : departureDate;
    const formattedCheckDate = checkDate ? format(checkDate, 'yyyy-MM-dd') : '';

    try {
      const response = await fetch('/api/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formattedCheckDate, serviceType: 'transfer' }),
      });

      const result = await response.json();

      if (!result.success || !result.available) {
        toast({
          title: 'Transfer Unavailable',
          description: result.enabled
            ? `We've reached our capacity for transfers on ${formattedCheckDate}. Currently at ${result.current}/${result.max} bookings. Please try a different date or contact us directly.`
            : 'Unable to check availability. Please try again.',
          variant: 'destructive',
          duration: 10000,
        });
        setIsProcessing(false);
        return;
      }

      setShowPaypal(true);
    } catch (error) {
      console.error('Availability check failed:', error);
      toast({
        title: 'Error',
        description: 'Unable to verify availability. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const onPaymentSuccess = async (paypalOrderId: string, paypalTransactionId: string) => {
    toast({ title: 'Payment Successful!', description: 'Finalizing your booking, please wait...' });

    const showArrival = direction === 'arrive' || direction === 'round';
    const showDeparture = direction === 'depart' || direction === 'round';

    const bookingData = {
      type: 'transfer',
      guestName: guest.name,
      guestEmail: guest.email,
      customer: { name: guest.name, email: guest.email, phone: guest.phone },
      pricing: { totalUSD: total, currency: CURRENCY },
      details: {
        direction: direction,
        arrivalDate: showArrival && arrivalDate ? format(arrivalDate, 'yyyy-MM-dd') : null,
        departureDate: showDeparture && departureDate ? format(departureDate, 'yyyy-MM-dd') : null,
        arrivalFlight: showArrival ? arrivalFlight.trim() : null,
        arrivalAirline: showArrival ? arrivalAirline.trim() : null,
        departureFlight: showDeparture ? departureFlight.trim() : null,
        departureTime: showDeparture ? departureTime : null,
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
        toast({ title: "Booking Confirmed!", description: "Redirecting to your confirmation page.", variant: "default" });
        router.push(`/confirmation/airport-transfer?bid=${result.confirmationId}`);
      } else {
        throw new Error(result.error || 'Booking failed');
      }
    } catch (error: any) {
      console.error("Booking finalization failed:", error);
      toast({
        title: 'Booking Finalization Failed',
        description: `Your payment was successful, but we failed to save your booking. Please contact support with Transaction ID: ${paypalTransactionId}`,
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

  const showArrival = direction === 'arrive' || direction === 'round';
  const showDeparture = direction === 'depart' || direction === 'round';

  const steps = [
    { number: 1, label: "Selection" },
    { number: 2, label: "Details" },
    { number: 3, label: "Payment" }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      <section className="relative h-[50vh] w-full flex items-center justify-center text-center text-white bg-black">
        <Image
          src="/transfer-seamless-arrival.png"
          alt="Airport transfer seamless arrival"
          fill
          priority
          className="object-cover opacity-60"
          data-ai-hint="airport transfer seamless arrival"
        />
        <div className="relative z-10 p-6">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold drop-shadow-lg">
            Airport Transfer
          </h1>
          <p className="mt-4 text-lg md:text-2xl font-light drop-shadow-md max-w-2xl mx-auto">
            Professional transfer service between Punta Cana Airport and Sweet Home
          </p>
        </div>
      </section>

      {/* Main Content - 2 Column Layout */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-12">

          {/* Left Column - Booking Form (60%) */}
          <div className="space-y-12">

            {/* STEP 1: Selection */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg p-10 shadow-sm space-y-10">
                <h2 className="font-playfair text-3xl font-semibold text-shpc-ink">
                  1. Choose Your Route
                </h2>

                <div className="grid grid-cols-3 gap-4">
                  {(['arrive', 'depart', 'round'] as const).map((dir) => (
                    <button
                      key={dir}
                      onClick={() => setDirection(dir)}
                      className={`
                        py-5 px-6 border transition-all duration-300
                        font-inter text-sm font-medium
                        ${direction === dir
                          ? 'border-shpc-yellow bg-shpc-yellow text-shpc-ink shadow-md'
                          : 'border-neutral-300 bg-white text-neutral-700 hover:border-shpc-yellow/50'
                        }
                      `}
                    >
                      {DIRECTION_DETAILS[dir].label}
                    </button>
                  ))}
                </div>

                <div className="text-center py-4">
                  <p className="font-inter text-neutral-600">
                    {DIRECTION_DETAILS[direction].route}
                  </p>
                </div>

                <div className="space-y-8">
                  {showArrival && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Arrival Date Picker */}
                        <div className="space-y-3">
                          <label className="font-inter text-sm font-medium text-neutral-700 flex items-center gap-2">
                            Arrival Date <span className="text-shpc-yellow">*</span>
                          </label>
                          <Popover open={isArrivalCalendarOpen} onOpenChange={setIsArrivalCalendarOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal py-7 border-0 border-b border-neutral-300 rounded-none shadow-none hover:bg-transparent",
                                  !arrivalDate && "text-muted-foreground"
                                )}
                              >
                                {arrivalDate ? (
                                  format(arrivalDate, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={arrivalDate}
                                onSelect={handleArrivalDateChange}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <LuxuryInput
                          icon={<Plane className="h-5 w-5" />}
                          label="Airline"
                          placeholder="e.g. Delta"
                          value={arrivalAirline}
                          onChange={setArrivalAirline}
                          required
                        />
                        <LuxuryInput
                          icon={<Plane className="h-5 w-5" />}
                          label="Flight Number"
                          placeholder="e.g. AA 1234"
                          value={arrivalFlight}
                          onChange={setArrivalFlight}
                          required
                        />
                      </div>
                      <p className="text-sm text-neutral-500 italic flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        We track your flight for peace of mind in case of delays.
                      </p>
                    </div>
                  )}

                  {showDeparture && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Departure Date Picker */}
                        <div className="space-y-3">
                          <label className="font-inter text-sm font-medium text-neutral-700 flex items-center gap-2">
                            Departure Date <span className="text-shpc-yellow">*</span>
                          </label>
                          <Popover open={isDepartureCalendarOpen} onOpenChange={setIsDepartureCalendarOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal py-7 border-0 border-b border-neutral-300 rounded-none shadow-none hover:bg-transparent",
                                  !departureDate && "text-muted-foreground"
                                )}
                              >
                                {departureDate ? (
                                  format(departureDate, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={departureDate}
                                onSelect={handleDepartureDateChange}
                                disabled={(date) => date < departureMinDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <LuxuryInput
                          icon={<Clock className="h-5 w-5" />}
                          label="Pickup Time"
                          type="time"
                          value={departureTime}
                          onChange={setDepartureTime}
                          required
                        />
                        <LuxuryInput
                          icon={<Plane className="h-5 w-5" />}
                          label="Departure Flight Number"
                          placeholder="e.g. UA 5678"
                          value={departureFlight}
                          onChange={setDepartureFlight}
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                    <div className="bg-blue-100 p-2 rounded-full h-fit">
                      <Info className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-blue-900 text-sm">Important Note</p>
                      <p className="text-blue-800/80 text-sm mt-1 leading-relaxed">
                        Maximum occupancy: 2 people. Additional charges apply for more than 2 passengers.
                      </p>
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

            {/* STEP 2: Details */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg p-10 shadow-sm space-y-10">
                <h2 className="font-playfair text-3xl font-semibold text-shpc-ink">
                  2. Flight & Guest Details
                </h2>

                <div className="space-y-8">
                  <h3 className="font-inter text-lg font-semibold text-shpc-ink border-b border-neutral-200 pb-3">
                    Guest Information
                  </h3>

                  <LuxuryInput
                    icon={<Users className="h-5 w-5" />}
                    label="Full Name on Reservation"
                    placeholder="John Doe"
                    value={guest.name}
                    onChange={v => setGuest(g => ({ ...g, name: v }))}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <LuxuryInput
                      icon={<Mail className="h-5 w-5" />}
                      label="Email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={guest.email}
                      onChange={v => setGuest(g => ({ ...g, email: v }))}
                      required
                    />

                    <LuxuryInput
                      icon={<Phone className="h-5 w-5" />}
                      label="Phone"
                      placeholder="+1 555 123 4567"
                      value={guest.phone}
                      onChange={v => setGuest(g => ({ ...g, phone: v }))}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    className="flex-1 py-7 border-neutral-300"
                  >
                    BACK
                  </Button>
                  <Button
                    onClick={handleContinueStep2}
                    className="flex-1 bg-shpc-yellow hover:bg-shpc-yellow/90 text-shpc-ink font-semibold py-7"
                  >
                    CONTINUE
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Review & Confirm - Boarding Pass Style */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg p-10 shadow-sm space-y-10">
                <div className="space-y-2">
                  <h2 className="font-playfair text-4xl font-semibold text-shpc-ink">
                    3. Review & Confirm Your Trip
                  </h2>
                  <p className="font-inter text-neutral-600">
                    Please review your transfer details before confirming the booking.
                  </p>
                </div>

                {!showPaypal ? (
                  <>
                    {/* Boarding Pass Container */}
                    <div className="bg-[#FAF8F5] border-2 border-dashed border-neutral-300 rounded-lg overflow-hidden">
                      {/* Header */}
                      <div className="p-8 border-b border-neutral-300 flex items-start justify-between">
                        <div>
                          <p className="font-playfair text-2xl font-bold text-shpc-ink">Sweet Home</p>
                          <p className="font-playfair text-2xl font-bold text-shpc-ink">Punta Cana</p>
                        </div>
                        <div>
                          <p className="font-inter text-sm font-bold text-shpc-ink uppercase tracking-wider">
                            BOARDING PASS
                          </p>
                        </div>
                      </div>

                      {/* Main Content - Two Columns */}
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] divide-y md:divide-y-0 md:divide-x divide-dashed divide-neutral-300">

                        {/* Left Column - Trip Details */}
                        <div className="p-8 space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <p className="text-xs text-neutral-500 font-inter uppercase tracking-wide">Route:</p>
                              <p className="font-inter font-semibold text-shpc-ink">{DIRECTION_DETAILS[direction].label}</p>
                            </div>

                            {showArrival && arrivalFlight && (
                              <div className="space-y-1">
                                <p className="text-xs text-neutral-500 font-inter uppercase tracking-wide">Flight #:</p>
                                <p className="font-inter font-semibold text-shpc-ink">{arrivalAirline} {arrivalFlight}</p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs text-neutral-500 font-inter uppercase tracking-wide">Date:</p>
                            <p className="font-inter font-semibold text-shpc-ink">
                              {showArrival ? (arrivalDate ? format(arrivalDate, "MMM do yyyy") : "") : (departureDate ? format(departureDate, "MMM do yyyy") : "")}
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-1">
                              <p className="text-xs text-neutral-500 font-inter uppercase tracking-wide">From</p>
                              <p className="font-inter text-shpc-ink">Punta Cana Intl. Airport (PUJ)</p>
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs text-neutral-500 font-inter uppercase tracking-wide">To</p>
                              <p className="font-inter font-semibold text-shpc-ink">Sweet Home Punta Cana</p>
                            </div>
                          </div>


                        </div>

                        {/* Right Column - Passenger Info & QR */}
                        <div className="p-8 space-y-6 md:w-64">
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <p className="text-xs text-neutral-500 font-inter uppercase tracking-wide">Passengers</p>
                              <p className="font-inter font-semibold text-shpc-ink">{passengers}</p>
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs text-neutral-500 font-inter uppercase tracking-wide">Guest Name</p>
                              <p className="font-playfair font-bold text-shpc-ink text-lg uppercase">
                                {guest.name || 'GUEST NAME'}
                              </p>
                            </div>

                            {guest.email && (
                              <div className="space-y-1">
                                <p className="text-xs text-neutral-500 font-inter uppercase tracking-wide">Email</p>
                                <p className="font-inter text-sm text-shpc-ink break-all">{guest.email}</p>
                              </div>
                            )}

                            {guest.phone && (
                              <div className="space-y-1">
                                <p className="text-xs text-neutral-500 font-inter uppercase tracking-wide">Phone</p>
                                <p className="font-inter text-sm text-shpc-ink">{guest.phone}</p>
                              </div>
                            )}
                          </div>


                        </div>
                      </div>
                    </div>

                    {/* Peace of Mind Note */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                      <div className="bg-blue-100 p-2 rounded-full h-fit">
                        <Check className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-blue-900 text-sm">🌟 Peace of Mind Promise</p>
                        <p className="text-blue-800/80 text-sm mt-1 leading-relaxed">
                          Your driver will be waiting for you at the airport exit holding a sign with your name. We proactively track your flight for any delays, ensuring your pick-up is on time, every time.
                        </p>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex items-start space-x-3 pt-4">
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                        className="mt-1"
                      />
                      <label htmlFor="terms" className="text-sm text-neutral-600 font-inter leading-relaxed">
                        I accept the{' '}
                        <Link href="/terms/transfers" target="_blank" className="text-shpc-yellow hover:text-shpc-yellow/80 underline">
                          Transfer Policy and Conditions
                        </Link>
                        .
                      </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4 pt-6">
                      <Button
                        onClick={() => setCurrentStep(2)}
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
                  <div className="space-y-6" ref={paymentContainerRef}>
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

          {/* Right Column - Luxury Ticket Summary (40%) */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header */}
              <div className="p-10 border-b border-neutral-200">
                <h3 className="font-playfair text-2xl font-semibold text-shpc-ink uppercase tracking-wide">
                  Your Ticket Summary
                </h3>
              </div>

              {/* Itinerary Details */}
              <div className="p-10 space-y-6">
                <div className="space-y-5">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-neutral-500 font-inter uppercase tracking-wide">Route</span>
                    <span className="font-inter font-semibold text-shpc-ink text-right">{DIRECTION_DETAILS[direction].short}</span>
                  </div>

                  {showArrival && arrivalDate && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-neutral-500 font-inter uppercase tracking-wide">Arrival</span>
                      <span className="font-inter font-semibold text-shpc-ink">{format(arrivalDate, "MMM do yyyy")}</span>
                    </div>
                  )}

                  {showDeparture && departureDate && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-neutral-500 font-inter uppercase tracking-wide">Departure</span>
                      <span className="font-inter font-semibold text-shpc-ink">{format(departureDate, "MMM do yyyy")} {departureTime}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <span className="text-sm text-neutral-500 font-inter uppercase tracking-wide">Passengers</span>
                    <span className="font-inter font-semibold text-shpc-ink">{passengers}</span>
                  </div>
                </div>

                {/* Price Block - Luxury Receipt Style */}
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
                      <span>24/7 Flight tracking</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-shpc-yellow shrink-0" strokeWidth={3} />
                      <span>Meet & greet service</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-shpc-yellow shrink-0" strokeWidth={3} />
                      <span>Luggage assistance</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-shpc-yellow shrink-0" strokeWidth={3} />
                      <span>Professional driver</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Luxury Input Component with bottom border only
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

export default function AirportTransferPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]"><Loader2 className="h-8 w-8 animate-spin text-shpc-yellow" /></div>}>
      <AirportTransferPageComponent />
    </Suspense>
  )
}

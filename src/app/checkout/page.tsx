'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { BookingDetails } from '@/lib/types';
import { format, parseISO, addDays } from 'date-fns';
import { ArrowLeft, Calendar as CalendarIcon, Loader2, CheckCircle, Clock, Phone } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { cn } from '@/lib/utils';
// Firebase removed - using API instead
import { PayPalButtonsWrapper } from '@/components/PayPalButtonsWrapper';
import CheckoutSummary from '@/components/CheckoutSummary'; // Assuming you extract this to its own file


type TripType = 'none' | 'one-way' | 'round-trip';

const pickupPrices = {
  puj: { 'one-way': 35, 'round-trip': 70 },
};

// Define the payload structure that will be sent to Firestore
interface FinalBookingPayload {
  type: 'room';
  customer: { name: string; email: string; phone: string };
  pricing: { totalUSD: number; currency: 'USD' };
  dates: { checkIn: string; checkOut: string };
  guests: number;
  room: {
    name: string;
    ids: string[];
  };
  transfer: {
    tripType: TripType;
    price: number;
    airline: string;
    flightNumber: string;
    arrivalDate: string | null;
    returnDate: string | null;
    returnFlightNumber: string;
  } | null;
  status: 'Pending Payment' | 'Confirmed';
  createdAt: any; // serverTimestamp
  updatedAt: any; // serverTimestamp
  guestUid: string | null;
  paypalOrderId?: string; // Optional PayPal order ID
  paypalTransactionId?: string; // Optional PayPal transaction ID
}

function CheckoutPageComponent() {
  const router = useRouter();
  const { toast } = useToast();

  const [bookingDetails, setBookingDetails] = React.useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [initError, setInitError] = React.useState<any>(null);

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  const [tripType, setTripType] = React.useState<TripType>('none');
  const [airline, setAirline] = React.useState('');
  const [flightNumber, setFlightNumber] = React.useState('');
  const [arrivalDate, setArrivalDate] = React.useState<Date | undefined>();
  const [returnDate, setReturnDate] = React.useState<Date | undefined>();
  const [returnFlightNumber, setReturnFlightNumber] = React.useState('');
  const [isArrivalCalendarOpen, setIsArrivalCalendarOpen] = React.useState(false);
  const [isReturnCalendarOpen, setIsReturnCalendarOpen] = React.useState(false);

  const [showPayPalButtons, setShowPayPalButtons] = React.useState(false);

  React.useEffect(() => {
    const storedDetails = localStorage.getItem('bookingDetails');
    if (storedDetails) {
      try {
        setBookingDetails(JSON.parse(storedDetails));
      } catch (error) {
        console.error("Failed to parse booking details:", error);
      }
    }
    setIsLoading(false);
  }, []);

  const pickupPrice = tripType !== 'none' ? pickupPrices.puj[tripType] : 0;
  const finalPrice = bookingDetails ? bookingDetails.totalPrice + pickupPrice : 0;

  const handleProceedToPayment = async () => {
    setInitError(null);
    if (!firstName || !lastName || !email || !termsAccepted) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, email and accept the terms.",
        variant: "destructive"
      });
      setInitError({ message: "Please fill in your name, email and accept the terms." });
      return;
    }

    if (!bookingDetails) {
      toast({ title: "Error", description: "Booking details are missing. Please start over.", variant: "destructive" });
      setInitError({ message: "Booking details are missing." });
      return;
    }

    setShowPayPalButtons(true);
  };

  const handlePaymentSuccess = async (paypalOrderId: string, paypalTransactionId: string) => {
    if (!bookingDetails) {
      toast({ title: "Error", description: "Payment successful, but booking details for finalization are missing.", variant: "destructive" });
      setInitError({ message: "Payment successful, but booking details for finalization are missing." });
      return;
    }

    setIsProcessing(true);

    const finalBookingPayload = {
      type: 'room',
      guestName: `${firstName} ${lastName}`,
      guestEmail: email,
      customer: { name: `${firstName} ${lastName}`, email, phone },
      pricing: { totalUSD: finalPrice, currency: 'USD' },
      dates: { checkIn: bookingDetails.dates.from, checkOut: bookingDetails.dates.to },
      guests: bookingDetails.guests,
      rooms: bookingDetails.rooms,
      transfer: tripType !== 'none' ? {
        tripType: tripType,
        price: pickupPrice,
        airline: airline,
        flightNumber: flightNumber,
        arrivalDate: arrivalDate ? format(arrivalDate, 'yyyy-MM-dd') : null,
        returnDate: returnDate ? format(returnDate, 'yyyy-MM-dd') : null,
        returnFlightNumber: returnFlightNumber,
      } : null,
      totalPrice: finalPrice,
      paypalOrderId,
      paypalTransactionId,
    };

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalBookingPayload),
      });

      const result = await response.json();

      if (result.success) {
        toast({ title: "Booking Confirmed", description: "Your room booking has been successfully confirmed!", variant: "default" });
        localStorage.removeItem('bookingDetails');
        router.push(`/confirmation?bid=${result.confirmationId}`);
      } else {
        throw new Error(result.error || 'Booking failed');
      }
    } catch (error: any) {
      console.error("Booking finalization failed:", error);
      const errorMessage = error.message || "Could not finalize booking after payment. Please contact support.";
      toast({ title: "Booking Finalization Failed", description: errorMessage, variant: "destructive" });
      setInitError({ message: errorMessage, payload: finalBookingPayload });
    } finally {
      setIsProcessing(false);
      setShowPayPalButtons(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error("PayPal Payment Error:", error);
    toast({
      title: "Payment Error",
      description: "There was an issue processing your payment. Please try again or contact support.",
      variant: "destructive"
    });
    setShowPayPalButtons(false);
    setIsProcessing(false);
  };

  const handlePaymentCancel = () => {
    toast({
      title: "Payment Cancelled",
      description: "You have cancelled the PayPal payment process.",
      variant: "default"
    });
    setShowPayPalButtons(false);
    setIsProcessing(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-shpc-sand">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!bookingDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-shpc-sand text-center p-4">
        <h2 className="text-2xl font-bold mb-2">Booking session expired</h2>
        <p className="text-muted-foreground mb-4">Your booking details were not found. Please start a new search.</p>
        <Button onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-shpc-sand min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="pl-0 hover:bg-transparent hover:text-shpc-yellow transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          <div className="flex-grow flex flex-col space-y-8">
            <Card className="shadow-soft rounded-2xl border-none bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <span className="text-2xl">🔒</span> Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="text-shpc-ink">First Name<span className="text-destructive">*</span></Label>
                    <Input id="first-name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="h-12 bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-shpc-ink">Last Name<span className="text-destructive">*</span></Label>
                    <Input id="last-name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="h-12 bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-shpc-ink">Email<span className="text-destructive">*</span></Label>
                    <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-shpc-ink">Phone</Label>
                    <Input id="phone" type="tel" placeholder="+1 (809) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 bg-white" />
                  </div>
                </div>

                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="mt-0.5">ℹ️</span>
                    Your data is protected. We will only use your phone number for important, time-sensitive updates regarding your reservation.
                  </p>
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} className="mt-1" />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal leading-relaxed">
                    I confirm that I have read the <Link href="/privacy" target="_blank" className="underline hover:text-shpc-yellow transition-colors">Privacy Statement</Link>, the <Link href="/rules" target="_blank" className="underline hover:text-shpc-yellow transition-colors">Rules & Restrictions</Link>, and the <Link href="/terms" target="_blank" className="underline hover:text-shpc-yellow transition-colors">Terms of Service</Link>.
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft rounded-2xl border-none bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <span className="text-2xl">✈️</span> Airport Transfer (PUJ Only)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {bookingDetails.guests > 2 ? (
                  <div className="p-4 bg-blue-50 text-blue-800 rounded-2xl border border-blue-200">
                    <p className="font-semibold">Have 3 or more guests?</p>
                    <p className="text-sm mt-1">Our standard transfer accommodates up to 2 passengers. For larger groups, please contact us directly to arrange a suitable vehicle.</p>
                    <Button asChild className="mt-3 bg-shpc-yellow hover:bg-shpc-yellow/90 text-white">
                      <a href="https://wa.me/18095105465" target="_blank" rel="noopener noreferrer">
                        <Phone className="mr-2 h-4 w-4" />
                        Contact Us on WhatsApp
                      </a>
                    </Button>
                  </div>
                ) : (
                  <>
                    <RadioGroup value={tripType} onValueChange={(value) => setTripType(value as TripType)} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Label htmlFor="none" className={cn("flex flex-col items-center justify-center text-center py-4 px-3 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-shpc-yellow/50", tripType === 'none' ? 'bg-shpc-yellow/10 border-shpc-yellow' : 'bg-white border-transparent shadow-sm')}>
                        <RadioGroupItem value="none" id="none" className="sr-only" />
                        <span className="font-medium text-shpc-ink">No Pickup</span>
                      </Label>
                      <Label htmlFor="one-way" className={cn("flex flex-col items-center justify-center text-center py-4 px-3 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-shpc-yellow/50", tripType === 'one-way' ? 'bg-shpc-yellow/10 border-shpc-yellow' : 'bg-white border-transparent shadow-sm')}>
                        <RadioGroupItem value="one-way" id="one-way" className="sr-only" />
                        <span className="font-medium text-shpc-ink">One-way</span>
                        <span className="font-bold text-lg text-shpc-yellow mt-1">${pickupPrices.puj['one-way']}</span>
                      </Label>
                      <Label htmlFor="round-trip" className={cn("flex flex-col items-center justify-center text-center py-4 px-3 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-shpc-yellow/50", tripType === 'round-trip' ? 'bg-shpc-yellow/10 border-shpc-yellow' : 'bg-white border-transparent shadow-sm')}>
                        <RadioGroupItem value="round-trip" id="round-trip" className="sr-only" />
                        <span className="font-medium text-shpc-ink">Round Trip</span>
                        <span className="font-bold text-lg text-shpc-yellow mt-1">${pickupPrices.puj['round-trip']}</span>
                      </Label>
                    </RadioGroup>

                    <p className="text-sm text-muted-foreground italic mt-2">
                      Maximum occupancy: 2 people. Additional charges apply for more than 2 passengers.
                    </p>

                    {tripType !== 'none' && (
                      <div className="space-y-6 pt-6 border-t border-dashed">
                        <div>
                          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <span className="text-xl">🛬</span> Arrival Details
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="arrival-date">Arrival Date</Label>
                              <Popover open={isArrivalCalendarOpen} onOpenChange={setIsArrivalCalendarOpen}>
                                <PopoverTrigger asChild>
                                  <Button variant={'outline'} className="w-full justify-start text-left font-normal h-12 bg-white">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {arrivalDate ? format(arrivalDate, 'PPP') : <span>Select date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={arrivalDate}
                                    onSelect={(date) => {
                                      setArrivalDate(date);
                                      setIsArrivalCalendarOpen(false);
                                    }}
                                    initialFocus
                                    disabled={{ before: addDays(new Date(), 1) }}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="airline">Airline</Label>
                              <Input id="airline" placeholder="e.g., Delta" value={airline} onChange={(e) => setAirline(e.target.value)} className="h-12 bg-white" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="flight-number">Flight Number</Label>
                              <Input id="flight-number" placeholder="e.g., DL1234" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} className="h-12 bg-white" />
                            </div>
                          </div>
                        </div>

                        {tripType === 'round-trip' && (
                          <div className="pt-4">
                            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                              <span className="text-xl">🛫</span> Return Details
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="return-date">Return Date</Label>
                                <Popover open={isReturnCalendarOpen} onOpenChange={setIsReturnCalendarOpen}>
                                  <PopoverTrigger asChild>
                                    <Button variant={'outline'} className="w-full justify-start text-left font-normal h-12 bg-white">
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {returnDate ? format(returnDate, 'PPP') : <span>Select date</span>}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={returnDate}
                                      onSelect={(date) => {
                                        setReturnDate(date);
                                        setIsReturnCalendarOpen(false);
                                      }}
                                      initialFocus
                                      disabled={{ before: addDays(new Date(), 1) }}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="return-flight-number">Return Flight (Optional)</Label>
                                <Input id="return-flight-number" placeholder="e.g., DL5678" value={returnFlightNumber} onChange={(e) => setReturnFlightNumber(e.target.value)} className="h-12 bg-white" />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-shpc-yellow/10 p-5 rounded-xl border border-shpc-yellow/20 mt-6">
                          <p className="text-shpc-ink text-sm leading-relaxed">
                            <span className="font-bold block mb-1 text-base">🌟 Peace of Mind Promise</span>
                            We proactively track your flight for any delays, ensuring your pick-up is on time, every time. Your driver will greet you with a sign at the airport exit.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              {!showPayPalButtons ? (
                <Button size="lg" className="w-full h-14 text-lg font-semibold bg-shpc-yellow hover:bg-shpc-yellow/90 text-shpc-ink shadow-lg transition-all transform hover:scale-[1.01]" onClick={handleProceedToPayment} disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="animate-spin mr-2" /> : 'Proceed to Payment'}
                </Button>
              ) : (
                <>
                  {finalPrice > 0 && (
                    <PayPalButtonsWrapper
                      amount={finalPrice.toFixed(2)}
                      currency="USD"
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                      onPaymentCancel={handlePaymentCancel}
                    />
                  )}
                  {finalPrice === 0 && (
                    <Button size="lg" className="w-full h-12" onClick={() => handlePaymentSuccess('N/A', 'N/A')} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm Free Booking'}
                    </Button>
                  )}
                  <Button variant="outline" className="w-full h-12" onClick={() => setShowPayPalButtons(false)} disabled={isProcessing}>
                    Cancel Payment
                  </Button>
                </>
              )}

              {initError && (
                <Card className="bg-destructive/10 border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive text-lg">Booking Failed</CardTitle>
                    <CardDescription className="text-destructive/80">The following error occurred: {initError.message}</CardDescription>
                  </CardHeader>
                  {initError.payload && (
                    <CardContent>
                      <p className="text-sm font-semibold mb-2">Data Sent to Server:</p>
                      <pre className="text-xs whitespace-pre-wrap font-mono bg-background/50 p-2 rounded-md">
                        <code>{JSON.stringify(initError.payload, null, 2)}</code>
                      </pre>
                    </CardContent>
                  )}
                </Card>
              )}
            </div>

          </div>

          <div className="lg:sticky top-24 w-full lg:w-96">
            <CheckoutSummary
              bookingDetails={bookingDetails}
              pickupPrice={pickupPrice}
              tripType={tripType}
              airline={airline}
              flightNumber={flightNumber}
              arrivalDate={arrivalDate}
              returnDate={returnDate}
              returnFlightNumber={returnFlightNumber}
            />


          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-shpc-sand">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <CheckoutPageComponent />;
}

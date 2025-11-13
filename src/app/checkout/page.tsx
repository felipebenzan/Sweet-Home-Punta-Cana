'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { BookingDetails } from '@/lib/types';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { ArrowLeft, User, Calendar as CalendarIcon, BedDouble, Users as UsersIcon, Plane, Info, CheckCircle, Clock, Phone, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {PayPalButtonsWrapper} from '@/components/PayPalButtonsWrapper';

type TripType = 'none' | 'one-way' | 'round-trip';

const pickupPrices = {
  puj: { 'one-way': 35, 'round-trip': 70 },
};

const CheckoutSummary = ({ bookingDetails, pickupPrice, tripType, airline, flightNumber, arrivalDate, returnDate, returnFlightNumber }: { 
  bookingDetails: BookingDetails, 
  pickupPrice: number,
  tripType: TripType,
  airline?: string,
  flightNumber?: string,
  arrivalDate?: Date,
  returnDate?: Date,
  returnFlightNumber?: string,
}) => {
  if (!bookingDetails) return null;

  const { rooms, dates, guests, nights, totalPrice } = bookingDetails;
  const fromDate = parseISO(dates.from);
  const toDate = parseISO(dates.to);
  
  const finalPrice = totalPrice + pickupPrice;
  const isPickupSelected = tripType !== 'none';
  
  const missingArrivalDetails = isPickupSelected && (!airline || !flightNumber || !arrivalDate);
  const missingDepartureDetails = tripType === 'round-trip' && (!returnFlightNumber || !returnDate);


  return (
    <div className="space-y-6 lg:w-[420px] shrink-0">
      <Card className="bg-white shadow-soft rounded-2xl">
        <CardHeader className="p-6">
          <h3 className="text-2xl font-bold">Your Booking</h3>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2"><CalendarIcon className="h-4 w-4"/>Dates</span>
              <span className="font-semibold text-right">{format(fromDate, 'MMM dd, yyyy')} – {format(toDate, 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2"><UsersIcon className="h-4 w-4"/> Guests</span>
              <span className="font-bold text-black text-base">{guests} {guests === 1 ? 'guest' : 'guests'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4"/> Nights</span>
              <span className="font-bold text-black text-base">{nights} {nights === 1 ? 'night' : 'nights'}</span>
            </div>
          </div>

          <Separator />
          
          {rooms.map(room => (
            <div key={room.id} className="space-y-2">
              <div className="flex gap-4 items-start">
                <Image src={room.image || 'https://picsum.photos/seed/room-placeholder/80/60'} alt={room.name} width={80} height={60} className="rounded-lg object-cover aspect-[4/3]" data-ai-hint="hotel room" />
                <div className="flex-grow">
                  <p className="font-semibold">{room.name}</p>
                  <p className="text-sm text-muted-foreground">{room.bedding} bed</p>
                  <div className="flex justify-between text-sm mt-1">
                    <span>${room.price.toFixed(2)} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                    <span className="font-medium text-foreground">${(room.price * nights).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isPickupSelected && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold text-base">Airport Pickup (PUJ)</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span className="w-1/3">Type:</span>
                    <span className="font-medium text-foreground text-right truncate w-2/3">{tripType === 'one-way' ? 'From Punta Cana Airport to Sweet Home Punta Cana' : 'Round Trip'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Arrival:</span>
                    <span className="font-medium text-foreground text-right truncate">{arrivalDate ? format(arrivalDate, 'MMM dd, yyyy') : '—'} • {airline || '—'} • {flightNumber || '—'}</span>
                  </div>
                  {tripType === 'round-trip' && (
                    <div className="flex justify-between">
                      <span>Departure:</span>
                      <span className="font-medium text-foreground text-right truncate">{returnDate ? format(returnDate, 'MMM dd, yyyy') : '—'} • {returnFlightNumber || '—'}</span>
                    </div>
                  )}
                </div>
                {(missingArrivalDetails || missingDepartureDetails) && (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-md">We’ll request missing flight details after booking.</p>
                )}
              </div>
            </>
          )}

          <Separator />
          
          <div className="space-y-1">
            <h4 className="font-semibold text-base mb-2">Price Details</h4>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Room Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            {isPickupSelected && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Airport Pickup</span>
                <span>${pickupPrice.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-green-600 font-medium pt-1">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4"/>All taxes & fees included</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4"/>No hidden charges.</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-bold text-lg items-baseline">
            <span>Total (USD)</span>
            <span className="font-mono text-2xl">${finalPrice.toFixed(2)}</span>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <div className="p-4 bg-green-50 text-green-800 rounded-2xl text-sm space-y-2 w-full">
            <p className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5 shrink-0"/> Check-in: 3:00 PM • Check-out: 11:00 AM</p>
            <p className="flex items-start gap-2"><Info className="h-4 w-4 mt-0.5 shrink-0"/> Free cancellation up to 48h before arrival.</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
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
  const firestore = useFirestore();
  const { user } = useUser();
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

  // PayPal related states
  const [showPayPalButtons, setShowPayPalButtons] = React.useState(false);
  const [bookingDetailsForPayment, setBookingDetailsForPayment] = React.useState<FinalBookingPayload | null>(null);


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
      setInitError({ message: "Please fill in your name, email and accept the terms."});
      return;
    }

    if (!bookingDetails || !firestore) {
        toast({ title: "Error", description: "Booking details are missing or database connection failed. Please start over.", variant: "destructive" });
        setInitError({ message: "Booking details are missing or DB connection failed."});
        return;
    }

    setIsProcessing(true);
    
    const initialBookingPayload: FinalBookingPayload = {
      type: 'room' as const,
      customer: { name: `${firstName} ${lastName}`, email, phone },
      pricing: { totalUSD: finalPrice, currency: 'USD' },
      dates: { checkIn: bookingDetails.dates.from, checkOut: bookingDetails.dates.to },
      guests: bookingDetails.guests,
      room: {
        name: bookingDetails.rooms.map(r => r.name).join(', '),
        ids: bookingDetails.rooms.map(r => r.id),
      },
      transfer: tripType !== 'none' ? {
        tripType: tripType,
        price: pickupPrice,
        airline: airline,
        flightNumber: flightNumber,
        arrivalDate: arrivalDate ? format(arrivalDate, 'yyyy-MM-dd') : null,
        returnDate: returnDate ? format(returnDate, 'yyyy-MM-dd') : null,
        returnFlightNumber: returnFlightNumber,
      } : null,
       status: 'Pending Payment', // Set initial status to pending
       createdAt: serverTimestamp(),
       updatedAt: serverTimestamp(),
       guestUid: user?.uid ?? null,
    };

    // Store this payload temporarily for PayPal to use and for final database write
    setBookingDetailsForPayment(initialBookingPayload);
    setShowPayPalButtons(true);
    setIsProcessing(false); // Done with initial processing, now waiting for PayPal interaction
  };

  const handlePaymentSuccess = async (paypalOrderId: string, paypalTransactionId: string) => {
    if (!bookingDetailsForPayment || !firestore) {
      toast({ title: "Error", description: "Payment successful, but booking details for finalization are missing.", variant: "destructive" });
      setInitError({ message: "Payment successful, but booking details for finalization are missing." });
      return;
    }

    setIsProcessing(true); // Indicate processing for database write

    const finalBookingPayload = {
      ...bookingDetailsForPayment,
      paypalOrderId,
      paypalTransactionId,
      status: 'Confirmed' as const, // Update status to Confirmed
      updatedAt: serverTimestamp(), // Update timestamp for confirmation
    };

    try {
      const docRef = await addDoc(collection(firestore, "reservations"), finalBookingPayload);
      toast({ title: "Booking Confirmed", description: "Your room booking has been successfully confirmed!", variant: "default" });
      // Clear local storage and navigate
      localStorage.removeItem('bookingDetails');
      router.push(`/confirmation?bid=${docRef.id}`);
    } catch (error: any) {
        console.error("Booking finalization failed:", error);
        const errorMessage = error.message || "Could not finalize booking after payment. Please contact support.";
        toast({ title: "Booking Finalization Failed", description: errorMessage, variant: "destructive" });
        // It's critical here: payment was successful, but DB failed. Log this for manual intervention.
        setInitError({ message: errorMessage, payload: finalBookingPayload });
    } finally {
        setIsProcessing(false);
        setShowPayPalButtons(false);
        setBookingDetailsForPayment(null);
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
    setBookingDetailsForPayment(null);
    setIsProcessing(false);
  };

  const handlePaymentCancel = () => {
    toast({
        title: "Payment Cancelled",
        description: "You have cancelled the PayPal payment process.",
        variant: "default"
    });
    setShowPayPalButtons(false);
    setBookingDetailsForPayment(null);
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
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Home
        </Button>
      </div>
    )
  }
  
  return (
      <div className="bg-shpc-sand min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            
            <div className="flex-grow flex flex-col space-y-8">
                <Card className="shadow-soft rounded-2xl">
                    <CardHeader>
                        <CardTitle>Guest Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first-name">First Name<span className="text-destructive">*</span></Label>
                                <Input id="first-name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last-name">Last Name<span className="text-destructive">*</span></Label>
                                <Input id="last-name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email<span className="text-destructive">*</span></Label>
                                <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" type="tel" placeholder="+1 (809) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 pt-4">
                            <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
                            <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal">
                            I confirm that I have read the <Link href="/privacy" target="_blank" className="underline hover:text-primary">Privacy Statement</Link>, the <Link href="/rules" target="_blank" className="underline hover:text-primary">Rules & Restrictions</Link>, and the <Link href="/terms" target="_blank" className="underline hover:text-primary">Terms of Service</Link>.
                            </Label>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="shadow-soft rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3"><span>✈️ Airport Pickup (PUJ Only)</span></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {bookingDetails.guests > 2 ? (
                          <div className="p-4 bg-blue-50 text-blue-800 rounded-2xl border border-blue-200">
                              <p className="font-semibold">Have 3 or more guests?</p>
                              <p className="text-sm mt-1">Our standard transfer accommodates up to 2 passengers. For larger groups, please contact us directly to arrange a suitable vehicle.</p>
                              <Button asChild className="mt-3">
                              <a href="https://wa.me/18095105465" target="_blank" rel="noopener noreferrer">
                                  <Phone className="mr-2 h-4 w-4" />
                                  Contact Us on WhatsApp
                              </a>
                              </Button>
                          </div>
                      ) : (
                        <>
                            <RadioGroup value={tripType} onValueChange={(value) => setTripType(value as TripType)} className="grid grid-cols-3 gap-2">
                                <Label htmlFor="none" className={cn("flex flex-col items-center justify-center text-center py-2 px-3 border rounded-lg cursor-pointer transition-colors h-auto", tripType === 'none' && 'bg-shpc-yellow border-shpc-yellow')}>
                                    <RadioGroupItem value="none" id="none" className="sr-only"/>
                                    <span className="font-medium text-sm">No Pickup</span>
                                </Label>
                                <Label htmlFor="one-way" className={cn("flex flex-col items-center justify-center text-center py-2 px-3 border rounded-lg cursor-pointer transition-colors h-auto", tripType === 'one-way' && 'bg-shpc-yellow border-shpc-yellow')}>
                                    <RadioGroupItem value="one-way" id="one-way" className="sr-only"/>
                                    <span className="font-medium text-sm">One-way</span>
                                    <span className="font-semibold text-base mt-1">${pickupPrices.puj['one-way']}</span>
                                </Label>
                                <Label htmlFor="round-trip" className={cn("flex flex-col items-center justify-center text-center py-2 px-3 border rounded-lg cursor-pointer transition-colors h-auto", tripType === 'round-trip' && 'bg-shpc-yellow border-shpc-yellow')}>
                                    <RadioGroupItem value="round-trip" id="round-trip" className="sr-only"/>
                                    <span className="font-medium text-sm">Round Trip</span>
                                    <span className="font-semibold text-base mt-1">${pickupPrices.puj['round-trip']}</span>
                                </Label>
                            </RadioGroup>

                            {tripType !== 'none' && (
                                <div className="space-y-4 pt-4 border-t mt-4">
                                    <h4 className="font-medium">Flight Details</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="airline">Airline</Label>
                                            <Input id="airline" placeholder="e.g., American" value={airline} onChange={(e) => setAirline(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="flight-number">Arrival Flight</Label>
                                            <Input id="flight-number" placeholder="e.g., AA123" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                        <Label htmlFor="arrival-date">Arrival Date</Label>
                                        <Popover open={isArrivalCalendarOpen} onOpenChange={setIsArrivalCalendarOpen}>
                                            <PopoverTrigger asChild>
                                            <Button variant={'outline'} className="w-full justify-start text-left font-normal">
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
                                    </div>
                                    {tripType === 'round-trip' && (
                                        <div className="space-y-4 pt-4 border-t mt-4">
                                            <h4 className="font-medium">Return Flight (Optional)</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="return-flight-number">Return Flight</Label>
                                                    <Input id="return-flight-number" placeholder="e.g., AA456" value={returnFlightNumber} onChange={(e) => setReturnFlightNumber(e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="return-date">Return Date</Label>
                                                    <Popover open={isReturnCalendarOpen} onOpenChange={setIsReturnCalendarOpen}>
                                                        <PopoverTrigger asChild>
                                                        <Button variant={'outline'} className="w-full justify-start text-left font-normal">
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
                                            </div>
                                            <p className="text-xs text-muted-foreground">You can provide return flight details later via your confirmation email or WhatsApp.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                      )}
                    </CardContent>
                </Card>

                {!showPayPalButtons ? (
                  <Button size="lg" className="w-full h-12" onClick={handleProceedToPayment} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="animate-spin" /> : 'Proceed to Payment'}
                  </Button>
                ) : (
                  <>
                    {finalPrice > 0 && bookingDetailsForPayment && ( // Only show PayPal if price is greater than 0
                      <PayPalButtonsWrapper
                        amount={finalPrice.toFixed(2)}
                        currency="USD" // Your documented currency
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                        onPaymentCancel={handlePaymentCancel}
                      />
                    )}
                    {finalPrice === 0 && ( // Handle free bookings if applicable
                        <Button size="lg" className="w-full h-12" onClick={handlePaymentSuccess} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm Free Booking'}
                        </Button>
                    )}
                    {/* Optional: Add a 'Cancel Payment' button to go back to the form */}
                    <Button variant="outline" className="w-full h-12 mt-2" onClick={() => setShowPayPalButtons(false)} disabled={isProcessing}>
                        Cancel Payment
                    </Button>
                  </>
                )}


               {initError && (
                    <Card className="mt-4 bg-destructive/10 border-destructive">
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
            
            <div className="lg:sticky top-24">
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

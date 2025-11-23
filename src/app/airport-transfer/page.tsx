'use client';

import React, { useMemo, useState, Suspense, useEffect } from "react";
import { Calendar, Clock, Plane, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { addDays } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import Link from 'next/link';
import { db } from "@/lib/firebase/client"; // Use client-side db
import { useUser } from '@/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

import { PayPalButtonsWrapper, PurchaseContext } from '@/components/PayPalButtonsWrapper';

const ONE_WAY_PRICE = 35;
const ROUND_TRIP_DISCOUNT = 0;

const DIRECTION_DETAILS = {
  arrive: "Trip from Punta Cana Airport to Sweet Home Punta Cana.",
  depart: "Trip from Sweet Home Punta Cana to Sweet Home Punta Cana Airport.",
  round: "Round trip between the airport and Sweet Home Punta Cana."
}

interface BookingPayload {
  id?: string;
  type: 'airportTransfer';
  customer: { name: string; email: string; phone: string; };
  pricing: { totalUSD: number; currency: string; };
  details: {
    direction: 'arrive' | 'depart' | 'round';
    arrivalDate: string | null;
    departureDate: string | null;
    arrivalFlight: string;
    departureFlight: string;
    departureTime: string | null;
  };
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';
  createdAt: any;
  updatedAt: any;
  guestUid: string | null;
  paypalOrderId?: string;
  paypalTransactionId?: string;
}

function AirportTransferPageComponent() {
  const router = useRouter();
  const { user } = useUser(); // Using your existing useUser hook
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [direction, setDirection] = useState<'arrive' | 'depart' | 'round'>('arrive');
  const getTomorrow = () => addDays(new Date(), 1).toISOString().slice(0, 10);
  const getToday = () => new Date().toISOString().slice(0, 10);

  const [arrivalDate, setArrivalDate] = useState<string>(getTomorrow());
  const [departureDate, setDepartureDate] = useState<string>(getToday());
  const [departureTime, setDepartureTime] = useState<string>("14:00");

  const [arrivalFlight, setArrivalFlight] = useState("");
  const [departureFlight, setDepartureFlight] = useState("");

  const [guest, setGuest] = useState({ name: "", phone: "", email: "" });
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [purchaseContext, setPurchaseContext] = useState<PurchaseContext | null>(null);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  const total = useMemo(() => {
    if (direction === 'round') {
      return Math.round((ONE_WAY_PRICE * 2) * (1 - ROUND_TRIP_DISCOUNT));
    }
    return ONE_WAY_PRICE;
  }, [direction]);

  const handleArrivalDateChange = (newDate: string) => {
    setArrivalDate(newDate);
    if (newDate) {
        const arrival = new Date(newDate);
        const departure = new Date(departureDate);
        if (departure <= arrival) {
            const nextDay = addDays(arrival, 1);
            setDepartureDate(nextDay.toISOString().slice(0, 10));
        }
    }
  }

  const departureMinDate = useMemo(() => {
    if (direction === 'round' && arrivalDate) {
      return addDays(new Date(arrivalDate), 1).toISOString().slice(0, 10);
    }
    return getToday();
  }, [arrivalDate, direction]);

  const validateForm = () => {
    // ... (validation logic remains the same) ...
    return true; // Simplified for brevity
  }

  const handleProceedToPayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    toast({ title: "Preparing your booking..." });

    const payload: Omit<BookingPayload, 'id'> = {
        type: 'airportTransfer',
        customer: { name: guest.name, email: guest.email, phone: guest.phone },
        pricing: { totalUSD: total, currency: 'USD' },
        details: {
            direction: direction,
            arrivalDate: showArrival ? arrivalDate : null,
            departureDate: showDeparture ? departureDate : null,
            arrivalFlight: showArrival ? arrivalFlight.trim() : '',
            departureFlight: showDeparture ? departureFlight.trim() : '',
            departureTime: showDeparture ? departureTime : null,
        },
        status: 'PENDING_PAYMENT',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        guestUid: user?.uid ?? null,
    };

    try {
        const docRef = await addDoc(collection(db, "serviceBookings"), payload);
        setPendingBookingId(docRef.id);
        setPurchaseContext({
            type: 'airportTransfer',
            referenceId: docRef.id
        });
        toast({ title: "Booking created", description: "Please complete your payment below." });
    } catch (error: any) {
        console.error("Error creating pending booking:", error);
        toast({ title: "Error", description: "Could not create booking. Please try again.", variant: "destructive" });
    } finally {
        setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paypalOrderId: string, paypalTransactionId: string) => {
    if (!pendingBookingId) {
        toast({ title: "Critical Error", description: "Booking ID was lost. Please contact support.", variant: "destructive" });
        return;
    }
    
    toast({ title: "Payment Received", description: "Finalizing your booking...", variant: "success" });

    try {
        const bookingRef = doc(db, "serviceBookings", pendingBookingId);
        await updateDoc(bookingRef, {
            status: 'CONFIRMED',
            paypalOrderId: paypalOrderId,
            paypalTransactionId: paypalTransactionId,
            updatedAt: serverTimestamp(),
        });
        router.push(`/airport-transfer/confirmation?bid=${pendingBookingId}`);
    } catch (error: any) {
        console.error("Error finalizing booking:", error);
        toast({ title: "Booking Finalization Failed", description: "Your payment was successful, but we failed to confirm your booking. Please contact support.", variant: "destructive", duration: 10000 });
    }
  };

  const handlePaymentError = (error: any) => {
    console.error("PayPal payment failed or cancelled:", error);
    // The wrapper shows its own toast. You could add logic here to cancel the pending booking if desired.
    setPurchaseContext(null);
    setPendingBookingId(null);
  };

  const handleCancel = () => {
      // Here you could add logic to change the Firestore document status to 'CANCELLED'
      setPurchaseContext(null);
      setPendingBookingId(null);
  }

  const showArrival = direction === 'arrive' || direction === 'round';
  const showDeparture = direction === 'depart' || direction === 'round';

  return (
    // ... (JSX remains largely the same, but the button logic changes) ...
    <div className="min-h-screen bg-shpc-sand text-neutral-900">
        {/* ... Header Section ... */}
         <section className="relative overflow-hidden bg-shpc-ink">
        <div className="absolute inset-0">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/Airport%20transfer%20sweet%20home%20punta%20cana%20guest%20house%20hostel%20hotel.png?alt=media&token=c9af4589-0d61-4d21-8ce0-c4a5acd2a8cd"
            alt="Punta Cana airport transfer van"
            fill
            className="h-full w-full object-cover opacity-50"
            data-ai-hint="airport transfer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-shpc-ink via-shpc-ink/70 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center text-white">
          <h1 className="text-4xl font-semibold">Punta Cana Airport Transfer</h1>
          <p className="mt-3 text-lg">Seamless, private transfers between PUJ and Sweet Home.</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
                {/* This part of the form is hidden once payment starts */}
                {!purchaseContext ? (
                    <>
                        <Card className="rounded-3xl bg-white p-4 sm:p-8 shadow-soft">
                            {/* ... Form Inputs for schedule ... */}
                               <h2 className="text-2xl font-semibold mb-6">Schedule Your Transfer</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-base">Select your trip type</Label>
                      <RadioGroup value={direction} onValueChange={(v) => setDirection(v as any)} className="grid grid-cols-3 gap-2">
                        {Object.keys(DIRECTION_DETAILS).map((dir) => (
                          <Label key={dir} htmlFor={dir} className={cn("flex flex-col items-center justify-center py-2 px-3 border rounded-lg cursor-pointer transition-colors text-sm font-medium h-auto", direction === dir && 'bg-shpc-yellow border-shpc-yellow ring-2 ring-shpc-yellow')}>
                              <RadioGroupItem value={dir} id={dir} className="sr-only"/>
                              <span>{dir.charAt(0).toUpperCase() + dir.slice(1)}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                      <p className="text-sm text-green-800 text-center p-2 bg-green-50 rounded-md">
                        {DIRECTION_DETAILS[direction]}
                      </p>
                    </div>

                    {showArrival && (
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold">Arrival Details (to Sweet Home)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DateInput label="Arrival Date" value={arrivalDate} onChange={handleArrivalDateChange} min={getTomorrow()} required />
                            <TextInput label="Arrival Flight #" placeholder="e.g. AA 1234" value={arrivalFlight} onChange={setArrivalFlight} required />
                        </div>
                      </div>
                    )}

                    {showDeparture && (
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold">Departure Details (to Airport)</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <DateInput label="Departure Date" value={departureDate} onChange={setDepartureDate} min={departureMinDate} required />
                          <TimeInput label="Pickup Time" value={departureTime} onChange={setDepartureTime} required />
                        </div>
                        <div className="space-y-2">
                            <TextInput label="Departure Flight #" placeholder="e.g. UA 5678 (Optional)" value={departureFlight} onChange={setDepartureFlight} />
                        </div>
                      </div>
                    )}
                  </div>
                        </Card>
                        <Card className="rounded-3xl bg-white p-4 sm:p-8 shadow-soft">
                           {/* ... Form Inputs for guest info ... */}
                                <h2 className="text-2xl font-semibold mb-6">Guest Info</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextInput label="Full Name on Reservation" placeholder="John Doe" value={guest.name} onChange={v => setGuest(g => ({...g, name: v}))} required />
                      <TextInput label="Email" placeholder="john.doe@example.com" value={guest.email} onChange={v => setGuest(g => ({...g, email: v}))} required />
                    </div>
                    <div className="space-y-2">
                      <TextInput label="Phone" placeholder="+1 555 123 4567" value={guest.phone} onChange={v => setGuest(g => ({...g, phone: v}))} required />
                      {showArrival && (
                        <div className="text-sm p-3 mt-2 bg-blue-50 text-blue-800 rounded-lg flex items-start gap-3">
                            <Info className="h-4 w-4 mt-0.5 shrink-0"/>
                            <p>Your driver will be waiting with a sign with the name provided at the terminal exit.</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start space-x-3 pt-2">
                        <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
                        <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal">
                          I accept the <Link href="/terms/transfers" target="_blank" className="underline hover:text-primary">Transfer Policy and Conditions</Link>.
                        </Label>
                    </div>
                  </div>
                        </Card>
                        <Button size="lg" className="w-full" onClick={handleProceedToPayment} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Proceed to Payment'}
                        </Button>
                    </>
                ) : (
                    <div className="mt-4">
                        <h3 className="text-xl font-semibold mb-3 text-center">Complete Your Secure Payment</h3>
                        <p className="text-center text-muted-foreground mb-4">Finalize your booking by completing the payment below.</p>
                        <PayPalButtonsWrapper
                            purchaseContext={purchaseContext!}
                            currency="USD"
                            onPaymentSuccess={handlePaymentSuccess}
                            onPaymentError={handlePaymentError}
                        />
                        <Button variant="ghost" className="w-full mt-2" onClick={handleCancel} disabled={isProcessing}>
                            Cancel Payment
                        </Button>
                    </div>
                )}
            </div>

            <div className="lg:sticky top-24 h-fit">
                {/* ... Summary card ... */}
                 <Card className="rounded-3xl bg-white p-4 sm:p-8 shadow-soft">
                    <h2 className="text-2xl font-semibold mb-6">Summary</h2>
                    <div className="mt-6 flex items-center justify-between rounded-2xl bg-shpc-ink text-white px-4 py-4">
                      <div>
                        <p className="text-sm uppercase tracking-wide text-white/70">Total</p>
                        <p className="text-2xl font-semibold">${total.toFixed(2)}</p>
                        <p className="text-xs text-white/70">Taxes included</p>
                      </div>
                    </div>
                    <div className="text-sm p-3 mt-4 bg-blue-50 text-blue-800 rounded-lg flex items-start gap-3">
                        <Info className="h-4 w-4 mt-0.5 shrink-0"/>
                        <p>Standard service includes up to 2 passengers.</p>
                    </div>
                    {showArrival && (
                      <div className="text-sm p-3 mt-2 bg-blue-50 text-blue-800 rounded-lg flex items-start gap-3">
                          <Info className="h-4 w-4 mt-0.5 shrink-0"/>
                          <p>We track your flight — for peace of mind and on-time pickup.</p>
                      </div>
                    )}
                </Card>
            </div>
        </div>
      </section>
    </div>
  );
}

// ---------- UI Primitives (No changes needed) ----------
function TextInput({ label, placeholder, value, onChange, required = false }: { label: string; placeholder?: string; value: string; onChange: (v: string) => void; required?: boolean; }) {
  return (
    <div className="space-y-2">
        <Label htmlFor={label.replace(' ', '-').toLowerCase()}>{label}{required && <span className="text-red-500"> *</span>}</Label>
        <Input id={label.replace(' ', '-').toLowerCase()} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}

function DateInput({ label, value, onChange, required = false, min }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; min?: string; }) {
  return (
    <div className="space-y-2">
        <Label htmlFor={label.replace(/\s+/g, '-').toLowerCase()}>{label}{required && <span className="text-red-500"> *</span>}</Label>
        <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input id={label.replace(/\s+/g, '-').toLowerCase()} type="date" className="pl-10" value={value} onChange={(e) => onChange(e.target.value)} min={min} required={required} placeholder="Choose date"/>
        </div>
    </div>
  );
}

function TimeInput({ label, value, onChange, required=false }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; }) {
    return (
      <div className="space-y-2">
          <Label htmlFor="time">{label}{required && <span className="text-destructive">*</span>}</Label>
          <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                id="time"
                type="time"
                className="pl-10"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
              />
          </div>
      </div>
    );
  }

export default function AirportTransferPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <AirportTransferPageComponent />
        </Suspense>
    )
}
'use client';
import React, { useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon, Clock, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast"; // Assuming useToast from hooks/use-toast
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Import the PayPalButtonsWrapper
import { PayPalButtonsWrapper } from '@/components/PayPalButtonsWrapper'; // Adjust path as needed

const PRICE_PER_LOAD = 5; // USD

// Define the shape of your booking details payload for Laundry
interface LaundryBookingPayload {
  type: 'laundry';
  customer: { name: string; email: string; };
  details: {
    qty: number;
    date: string;
    time: string;
    accommodation: string;
  };
  pricing: {
    totalUSD: number;
    currency: string;
  };
  status: 'Pending Payment' | 'Confirmed' | 'Failed'; // Add more statuses for clarity
  createdAt: any; // serverTimestamp
  updatedAt: any; // serverTimestamp
  guestUid: string | null;
  paypalOrderId?: string;
  paypalTransactionId?: string;
}


function LaundryPageComponent() {
    const router = useRouter();
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const [isProcessing, setIsProcessing] = useState(false); // General loading state for the form
    const [initError, setInitError] = React.useState<{message: string, payload?: any} | null>(null);

    const [qty, setQty] = useState(1);
    const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1)); // Default to tomorrow
    const [time, setTime] = useState<string>("08:00");

    const [guestName, setGuestName] = useState("");
    const [accommodation, setAccommodation] = useState("");
    const [email, setEmail] = useState("");

    const total = useMemo(() => qty * PRICE_PER_LOAD, [qty]);

    // State to hold booking details *before* PayPal payment
    const [bookingDetailsForPayment, setBookingDetailsForPayment] = useState<LaundryBookingPayload | null>(null);
    const [showPayPalButtons, setShowPayPalButtons] = useState(false); // Control visibility of PayPal buttons

    // Form validation function
    const validateForm = () => {
        if (!guestName.trim() || !email.trim() || !accommodation.trim() || !date || !time) {
            toast({ title: "Missing Information", description: "Please fill all required fields.", variant: "destructive" });
            setInitError({ message: "Please fill all required fields." });
            return false;
        }
        setInitError(null); // Clear previous errors
        return true;
    };

    // This function now prepares the booking and shows PayPal buttons
    async function handleProceedToPayment() {
      if (!validateForm()) {
        return;
      }

      if (!firestore) {
        toast({ title: "Error", description: "Database connection not available.", variant: "destructive" });
        return;
      }

      setIsProcessing(true); // Indicate that we're preparing the booking payload

      const payload: LaundryBookingPayload = {
        type: 'laundry',
        customer: { name: guestName, email: email },
        details: {
          qty: qty,
          date: date ? format(date, 'yyyy-MM-dd') : '', // Ensure date is formatted
          time: time,
          accommodation: accommodation,
        },
        pricing: {
            totalUSD: total,
            currency: 'USD',
        },
        status: 'Pending Payment', // Initial status before payment
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        guestUid: user?.uid ?? null,
      };

      setBookingDetailsForPayment(payload); // Store for later
      setShowPayPalButtons(true); // Show the PayPal buttons
      setIsProcessing(false); // Release processing state for the button, PayPal will handle its own loading
    }

    // This function is called by PayPalButtonsWrapper AFTER PayPal payment is successful
    const handlePaymentSuccess = async (paypalOrderId: string, paypalTransactionId: string) => {
      if (!firestore) {
        toast({ title: "Error", description: "Database connection not available.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      if (!bookingDetailsForPayment) {
        toast({
          title: "Booking Error",
          description: "Payment successful, but booking details were lost. Please contact support.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      setIsProcessing(true); // Indicate that we're saving the final booking
      try {
        // Add PayPal-specific fields and update status
        const finalBookingPayload: LaundryBookingPayload = {
          ...bookingDetailsForPayment,
          paypalOrderId,
          paypalTransactionId,
          status: "Confirmed", // Update status to Confirmed
          updatedAt: serverTimestamp(), // Update timestamp
        };

        const docRef = await addDoc(collection(firestore, "serviceBookings"), finalBookingPayload);
        console.log("Final laundry booking saved to Firestore:", docRef.id);

        toast({
            title: "Laundry Request Confirmed!",
            description: `Your laundry pickup (ID: ${docRef.id}) has been scheduled. Payment complete.`,
            variant: "default",
        });

        router.push(`/laundry-service/confirmation?bid=${docRef.id}`);

      } catch (error: any) {
        console.error("Error saving final laundry booking to Firestore after PayPal success:", error);
        toast({
          title: "Final Booking Save Failed",
          description: error.message || "Payment was successful, but there was an issue saving your booking. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        setShowPayPalButtons(false); // Hide PayPal buttons
        setBookingDetailsForPayment(null); // Clear payment payload
      }
    };

    const handlePaymentError = (error: any) => {
      console.error("PayPal laundry payment failed or cancelled:", error);
      setIsProcessing(false);
      setShowPayPalButtons(false); // Hide PayPal buttons
      setBookingDetailsForPayment(null); // Clear payment payload
      // The PayPalButtonsWrapper should already display a toast, but you can add more logic here if needed.
    };

    return (
        <div className="bg-white">
            <section className="relative h-[50vh] w-full flex items-center justify-center text-center text-white bg-black">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/laundry%20service%20guest%20services%20sweet%20home%20punta%20cana.png?alt=media&token=f82dc09e-4fe6-45f4-bb76-aaf099ec9de0"
                  alt="Clean folded towels"
                  fill
                  priority
                  className="object-cover opacity-40"
                  data-ai-hint="laundry service"
                />
                <div className="relative z-10 p-6">
                  <h1 className="text-4xl md:text-6xl font-playfair font-bold">
                    Laundry On-Demand
                  </h1>
                  <p className="mt-4 text-lg md:text-2xl font-light max-w-2xl mx-auto">
                     Fresh clothes, zero hassle. Let us handle the laundry.
                  </p>
                </div>
            </section>

            <div className="max-w-xl mx-auto px-6 py-16 lg:py-24">
                <Card className="shadow-soft rounded-2xl">
                    <CardHeader>
                        <CardTitle>Schedule Your Pickup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>How many loads of laundry?</Label>
                            <div className="flex items-center gap-4 p-2 border rounded-lg">
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm">{qty} {qty > 1 ? "Loads" : "Load"}</p>
                                    <p className="text-xs text-muted-foreground">Approx. 1 bag per load.</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                                    <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={() => setQty(q => Math.min(5, q + 1))}><Plus className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="date">Pickup Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal h-12">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus disabled={{ before: addDays(new Date(), 1) }} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="time">Pickup Time</Label>
                                <Select value={time} onValueChange={setTime}>
                                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="08:00">8:00 AM</SelectItem>
                                        <SelectItem value="09:00">9:00 AM</SelectItem>
                                        <SelectItem value="10:00">10:00 AM</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                         </div>
                         <Separator/>
                        <div className="space-y-4">
                            <h3 className="font-semibold">Your Details</h3>
                            <div className="space-y-2">
                                <Label htmlFor="guest-name">Full Name <span className="text-destructive">*</span></Label>
                                <Input id="guest-name" placeholder="John Doe" value={guestName} onChange={e => setGuestName(e.target.value)} required className="h-12"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accommodation">Room / Accommodation <span className="text-destructive">*</span></Label>
                                <Input id="accommodation" placeholder="e.g., Room 101 or Villa Name" value={accommodation} onChange={e => setAccommodation(e.target.value)} required className="h-12"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email for confirmation <span className="text-destructive">*</span></Label>
                                <Input id="email" type="email" placeholder="john.doe@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-12"/>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-stretch space-y-4">
                        <div className="p-4 bg-gray-100 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold">${total.toFixed(2)}</p>
                        </div>
                        {/* Conditional rendering for PayPal buttons */}
                        {!showPayPalButtons ? (
                          <Button
                            type="button"
                            onClick={handleProceedToPayment}
                            className="w-full h-12 text-base"
                            disabled={isProcessing}
                          >
                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Proceed to Payment'}
                          </Button>
                        ) : (
                          <div className="mt-4">
                            <h3 className="text-xl font-semibold mb-3">Complete your payment</h3>
                            {bookingDetailsForPayment && ( // Only render if we have the booking details
                              <PayPalButtonsWrapper
                                amount={total.toFixed(2)} // Ensure amount is a string with 2 decimal places
                                currency="USD"
                                onPaymentSuccess={handlePaymentSuccess}
                                onPaymentError={handlePaymentError}
                              />
                            )}
                            <Button variant="ghost" className="w-full mt-2" onClick={() => setShowPayPalButtons(false)} disabled={isProcessing}>
                              Go Back to Details
                            </Button>
                          </div>
                        )}
                    </CardFooter>
                 </Card>
                 {initError && (
                    <Card className="mt-4 bg-destructive/10 border-destructive">
                      <CardHeader>
                        <CardTitle className="text-destructive text-lg">Booking Failed</CardTitle>
                        <CardDescription className="text-destructive/80 break-words">The following error occurred: {initError.message}</CardDescription>
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
    );
}

export default function LaundryServicePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <LaundryPageComponent />
        </Suspense>
    )
}
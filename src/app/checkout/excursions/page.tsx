'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { Excursion } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, User, Calendar, Users as UsersIcon, CheckCircle, ArrowRight, MapPin, ExternalLink, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import EmbeddedMap from '@/components/embedded-map';
import { Suspense } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {PayPalButtonsWrapper} from '@/components/PayPalButtonsWrapper';

interface BundledItem extends Excursion {
  bookingDate?: string;
  adults: number;
}

interface ExcursionBookingDetails {
  mainExcursion: BundledItem;
  bundledItems: BundledItem[];
  totalPrice: number;
  bundleDiscount: number;
  bookingId?: string;
}

function OrderSummary({ bookingDetails }: { bookingDetails: ExcursionBookingDetails }) {
  const { mainExcursion, bundledItems, totalPrice, bundleDiscount } = bookingDetails;

  const getPriceForItem = (item: { price: Excursion['price'], adults: number }) => {
    return (item.adults * item.price.adult);
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-soft rounded-2xl">
        <CardHeader className="p-6">
          <h3 className="text-2xl font-bold">Your Experience</h3>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="space-y-4">
            <ExcursionSummaryItem item={mainExcursion} />
            {bundledItems.map(item => <ExcursionSummaryItem key={item.id} item={item} />)}
          </div>
          
          <Separator />
          
          <div className="space-y-1">
            <h4 className="font-semibold text-base mb-2">Price Details</h4>
            <div className="flex justify-between text-sm">
                <span>{mainExcursion.title} ({mainExcursion.adults} Adults)</span>
                <span>${getPriceForItem(mainExcursion).toFixed(2)}</span>
            </div>
             {bundledItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.title} ({item.adults} Adults)</span>
                    <span>${getPriceForItem(item).toFixed(2)}</span>
                </div>
            ))}
            {bundleDiscount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                    <span>Bundle Discount</span>
                    <span>-${bundleDiscount.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between text-sm text-green-600 font-medium pt-1">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4"/>All taxes & fees included</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-bold text-lg items-baseline">
            <span>Total (USD)</span>
            <span className="font-mono text-2xl">${totalPrice.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExcursionSummaryItem({ item }: { item: BundledItem }) {
    return (
        <div className="space-y-2 text-sm">
            <div className="flex gap-4 items-start">
                <Image src={item.image} alt={item.title} width={80} height={60} className="rounded-lg object-cover aspect-[4/3]" data-ai-hint="vacation excursion"/>
                <div className="flex-grow">
                    <p className="font-semibold">{item.title}</p>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <p className="flex items-center gap-1.5"><Calendar className="h-3 w-3"/> {item.bookingDate ? format(parseISO(item.bookingDate), 'EEEE, MMM dd') : 'Date TBD'}</p>
                        <p className="flex items-center gap-1.5"><UsersIcon className="h-3 w-3"/> {item.adults} Adults</p>
                        <p className="flex items-center gap-1.5"><Clock className="h-3 w-3"/> {item.practicalInfo.duration}</p>
                        <div className="flex items-start gap-1.5">
                            <MapPin className="h-3 w-3 mt-0.5 shrink-0"/>
                            <div>
                                <span>{item.practicalInfo.pickup}</span>
                                {item.practicalInfo.pickupMapLink && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-1 block text-blue-600">View Map</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-xl">
                                        <DialogHeader>
                                            <DialogTitle>Pickup Location for {item.title}</DialogTitle>
                                        </DialogHeader>
                                        <div className="w-full h-80 rounded-lg overflow-hidden mt-4">
                                            <EmbeddedMap mapUrl={item.practicalInfo.pickupMapLink} mode="walking" />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// function ExcursionCheckoutPageComponent() {
//   const router = useRouter();
//   const firestore = useFirestore();
//   const { user } = useUser();
//   const { toast } = useToast();
//   const [bookingDetails, setBookingDetails] = React.useState<ExcursionBookingDetails | null>(null);
//   const [isLoading, setIsLoading] = React.useState(true);
  
//   const [isProcessing, setIsProcessing] = React.useState(false);
//   const [initError, setInitError] = React.useState<{message: string, payload?: any} | null>(null);

//   const [firstName, setFirstName] = React.useState('');
//   const [lastName, setLastName] = React.useState('');
//   const [email, setEmail] = React.useState('');
//   const [phone, setPhone] = React.useState('');
//   const [termsAccepted, setTermsAccepted] = React.useState(false);

//   React.useEffect(() => {
//     const storedDetails = localStorage.getItem('excursionBookingDetails');
//     if (storedDetails) {
//       setBookingDetails(JSON.parse(storedDetails));
//     }
//     setIsLoading(false);
//   }, []);

//   const handleConfirmBooking = async () => {
//     setInitError(null);
//     if (!firstName || !lastName || !email || !termsAccepted) {
//       toast({
//           title: "Missing Information",
//           description: "Please fill out all required fields and accept the terms.",
//           variant: "destructive"
//       });
//       setInitError({ message: 'Please fill out all required fields and accept the terms.' });
//       return;
//     }
//     if (!bookingDetails || !firestore) {
//         toast({ title: "Error", description: "Booking details are missing or database connection failed.", variant: "destructive" });
//         setInitError({ message: "Booking details are missing or DB connection failed." });
//         return;
//     }

//     setIsProcessing(true);

//     const bookingPayload = {
//       type: 'excursion' as const,
//       excursionId: bookingDetails.mainExcursion.id,
//       customer: { name: `${firstName} ${lastName}`, email, phone },
//       pricing: { totalUSD: bookingDetails.totalPrice, currency: 'USD' },
//       details: {
//         excursion: {
//           name: bookingDetails.mainExcursion.title,
//           date: bookingDetails.mainExcursion.bookingDate,
//         },
//         pax: `${bookingDetails.mainExcursion.adults} Adults`,
//       },
//       status: 'Confirmed',
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//       guestUid: user?.uid ?? null, // Add the user's UID
//     };

//     try {
//       const docRef = await addDoc(collection(firestore, "serviceBookings"), bookingPayload);
//       router.push(`/confirmation/excursions?bid=${docRef.id}`);
//     } catch (error: any) {
//         console.error("Booking failed:", error);
//         const errorMessage = error.message || "Could not create booking. Please try again.";
//         toast({ title: "Booking Failed", description: errorMessage, variant: "destructive" });
//         setInitError({ message: errorMessage, payload: bookingPayload });
//     } finally {
//         setIsProcessing(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-shpc-sand">
//         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//       </div>
//     )
//   }

//   if (!bookingDetails) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-shpc-sand text-center p-4">
//         <h2 className="text-2xl font-bold mb-2">Booking session expired</h2>
//         <p className="text-muted-foreground mb-4">Your excursion details were not found. Please start a new search.</p>
//         <Button onClick={() => router.push('/excursions')}>
//             <ArrowLeft className="mr-2 h-4 w-4"/> Back to Excursions
//         </Button>
//       </div>
//     )
//   }
  
//   return (
//       <div className="bg-shpc-sand min-h-screen py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-6xl mx-auto">
//           <Button variant="ghost" onClick={() => router.back()} className="mb-4">
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back
//           </Button>
//           <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            
//             <div className="w-full flex flex-col space-y-8">
//                 <Card className="shadow-soft rounded-2xl">
//                     <CardHeader>
//                         <CardTitle>Who’s Joining Us?</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                             <div className="space-y-2">
//                                 <Label htmlFor="first-name">First Name<span className="text-destructive">*</span></Label>
//                                 <Input id="first-name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
//                             </div>
//                             <div className="space-y-2">
//                                 <Label htmlFor="last-name">Last Name<span className="text-destructive">*</span></Label>
//                                 <Input id="last-name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
//                             </div>
//                         </div>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                             <div className="space-y-2">
//                                 <Label htmlFor="email">Email<span className="text-destructive">*</span></Label>
//                                 <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
//                             </div>
//                             <div className="space-y-2">
//                                 <Label htmlFor="phone">Phone</Label>
//                                 <Input id="phone" type="tel" placeholder="+1 (809) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
//                             </div>
//                         </div>
//                         <div className="flex items-start space-x-3 pt-4">
//                             <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
//                             <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal">
//                             I confirm that I have read the <Link href="/privacy" target="_blank" className="underline hover:text-primary">Privacy Statement</Link> and the <Link href="/terms/excursions" target="_blank" className="underline hover:text-primary">Terms of Service</Link>.
//                             </Label>
//                         </div>
//                     </CardContent>
//                 </Card>
//                 <Button size="lg" className="w-full h-12" onClick={handleConfirmBooking} disabled={isProcessing}>
//                     {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
//                 </Button>
//               {initError && (
//                     <Card className="mt-4 bg-destructive/10 border-destructive">
//                       <CardHeader>
//                         <CardTitle className="text-destructive text-lg">Booking Failed</CardTitle>
//                         <CardDescription className="text-destructive/80">The following error occurred: {initError.message}</CardDescription>
//                       </CardHeader>
//                       {initError.payload && (
//                         <CardContent>
//                             <p className="text-sm font-semibold mb-2">Data Sent to Server:</p>
//                             <pre className="text-xs whitespace-pre-wrap font-mono bg-background/50 p-2 rounded-md">
//                             <code>{JSON.stringify(initError.payload, null, 2)}</code>
//                             </pre>
//                         </CardContent>
//                       )}
//                     </Card>
//                 )}
//             </div>
            
//             <div className="w-full lg:w-2/3 lg:sticky top-24">
//               <OrderSummary bookingDetails={bookingDetails} />
//             </div>
//           </div>
//         </div>
//       </div>
//   );
// }

// Define your ExcursionBookingDetails interface based on what's stored in localStorage
interface ExcursionBookingDetails {
  mainExcursion: {
    id: string;
    title: string;
    bookingDate: string;
    adults: number;
    // Add other relevant excursion details
  };
  totalPrice: number;
  // Add other details you might need for the booking payload
}

// Define the payload structure that will be sent to Firestore
interface FinalExcursionBookingPayload {
  type: 'excursion';
  excursionId: string;
  customer: { name: string; email: string; phone: string };
  pricing: { totalUSD: number; currency: 'USD' };
  details: {
    excursion: {
      name: string;
      date: string;
    };
    pax: string;
  };
  status: 'Pending Payment' | 'Confirmed';
  createdAt: any; // serverTimestamp
  updatedAt: any; // serverTimestamp
  guestUid: string | null;
  paypalOrderId?: string; // Optional PayPal order ID
  paypalTransactionId?: string; // Optional PayPal transaction ID
}


function ExcursionCheckoutPageComponent() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser(); // Ensure useUser provides { user } with a uid
  const { toast } = useToast();
  const [bookingDetails, setBookingDetails] = React.useState<ExcursionBookingDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [initError, setInitError] = React.useState<{message: string, payload?: any} | null>(null);

  // State for customer details
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  // PayPal related states
  const [showPayPalButtons, setShowPayPalButtons] = React.useState(false);
  const [bookingDetailsForPayment, setBookingDetailsForPayment] = React.useState<FinalExcursionBookingPayload | null>(null);


  React.useEffect(() => {
    const storedDetails = localStorage.getItem('excursionBookingDetails');
    if (storedDetails) {
      setBookingDetails(JSON.parse(storedDetails));
    }
    setIsLoading(false);
  }, []);

  const handleProceedToPayment = async () => {
    setInitError(null);
    if (!firstName || !lastName || !email || !termsAccepted) {
      toast({
          title: "Missing Information",
          description: "Please fill out all required fields and accept the terms.",
          variant: "destructive"
      });
      setInitError({ message: 'Please fill out all required fields and accept the terms.' });
      return;
    }
    if (!bookingDetails || !firestore) {
        toast({ title: "Error", description: "Booking details are missing or database connection failed.", variant: "destructive" });
        setInitError({ message: "Booking details are missing or DB connection failed." });
        return;
    }

    setIsProcessing(true); // Indicate that we are processing the initial booking step

    const initialBookingPayload: FinalExcursionBookingPayload = {
      type: 'excursion' as const,
      excursionId: bookingDetails.mainExcursion.id,
      customer: { name: `${firstName} ${lastName}`, email, phone },
      pricing: { totalUSD: bookingDetails.totalPrice, currency: 'USD' },
      details: {
        excursion: {
          name: bookingDetails.mainExcursion.title,
          date: bookingDetails.mainExcursion.bookingDate,
        },
        pax: `${bookingDetails.mainExcursion.adults} Adults`,
      },
      status: 'Pending Payment', // Set initial status to pending
      createdAt: serverTimestamp(), // Will be overwritten by handlePaymentSuccess with new timestamp, or kept if no payment
      updatedAt: serverTimestamp(),
      guestUid: user?.uid ?? null, // Add the user's UID
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
      const docRef = await addDoc(collection(firestore, "serviceBookings"), finalBookingPayload);
      toast({ title: "Booking Confirmed", description: "Your excursion booking has been successfully confirmed!", variant: "success" });
      // Clear local storage and navigate
      localStorage.removeItem('excursionBookingDetails');
      router.push(`/confirmation/excursions?bid=${docRef.id}`);
    } catch (error: any) {
        console.error("Booking finalization failed:", error);
        const errorMessage = error.message || "Could not finalize booking after payment. Please contact support.";
        toast({ title: "Booking Finalization Failed", description: errorMessage, variant: "destructive" });
        // It's critical here: payment was successful, but DB failed. Log this for manual intervention.
        setInitError({ message: errorMessage, payload: finalBookingPayload });
        // You might want to display a different message or guide the user to contact support with the PayPal transaction ID
    } finally {
        setIsProcessing(false);
        // Reset states to allow re-attempt or new booking, though a redirect is expected here
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
    // Optionally reset states to allow user to try again
    setShowPayPalButtons(false);
    setBookingDetailsForPayment(null);
    setIsProcessing(false); // Reset processing if it was set
  };

  const handlePaymentCancel = () => {
    toast({
        title: "Payment Cancelled",
        description: "You have cancelled the PayPal payment process.",
        variant: "info"
    });
    // Optionally reset states
    setShowPayPalButtons(false);
    setBookingDetailsForPayment(null);
    setIsProcessing(false); // Reset processing if it was set
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
        <p className="text-muted-foreground mb-4">Your excursion details were not found. Please start a new search.</p>
        <Button onClick={() => router.push('/excursions')}>
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Excursions
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
            
            <div className="w-full flex flex-col space-y-8">
                <Card className="shadow-soft rounded-2xl">
                    <CardHeader>
                        <CardTitle>Who’s Joining Us?</CardTitle>
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
                            I confirm that I have read the <Link href="/privacy" target="_blank" className="underline hover:text-primary">Privacy Statement</Link> and the <Link href="/terms/excursions" target="_blank" className="underline hover:text-primary">Terms of Service</Link>.
                            </Label>
                        </div>
                    </CardContent>
                </Card>

                {!showPayPalButtons ? (
                  <Button size="lg" className="w-full h-12" onClick={handleProceedToPayment} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="animate-spin" /> : 'Proceed to Payment'}
                  </Button>
                ) : (
                  <>
                    {bookingDetailsForPayment && (
                      <PayPalButtonsWrapper
                        amount={bookingDetailsForPayment.pricing.totalUSD.toFixed(2)}
                        currency={bookingDetailsForPayment.pricing.currency}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                        onPaymentCancel={handlePaymentCancel} // Added for better UX
                      />
                    )}
                    {/* Optionally add a 'Cancel Payment' button to go back to the form */}
                    <Button variant="outline" className="w-full h-12" onClick={() => setShowPayPalButtons(false)} disabled={isProcessing}>
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
            
            <div className="w-full lg:w-2/3 lg:sticky top-24">
              <OrderSummary bookingDetails={bookingDetails} />
            </div>
          </div>
        </div>
      </div>
  );
}

export default function ExcursionCheckoutPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-shpc-sand"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <ExcursionCheckoutPageComponent />
        </Suspense>
    );
}

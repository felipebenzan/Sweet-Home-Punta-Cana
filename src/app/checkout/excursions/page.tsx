'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Lock, Shield, Calendar, Users, Clock, MapPin, CheckCircle, Loader2, CreditCard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { PayPalButtonsWrapper } from '@/components/PayPalButtonsWrapper';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EmbeddedMap from "@/components/embedded-map";

interface ExcursionBookingDetails {
  mainExcursion: {
    id: string;
    title: string;
    image: string;
    bookingDate: string;
    adults: number;
    price: { adult: number };
    practicalInfo: {
      duration: string;
      pickup: string;
      pickupMapLink?: string;
      departure: string;
    }
  };
  bundledItems: Array<{
    id: string;
    title: string;
    image: string;
    bookingDate: string;
    adults: number;
    price: { adult: number };
    practicalInfo: {
      duration: string;
      pickup: string;
      pickupMapLink?: string;
      departure: string;
    }
  }>;
  totalPrice: number;
  bundleDiscount: number;
}

export default function ExcursionCheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [bookingDetails, setBookingDetails] = React.useState<ExcursionBookingDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showPayPalButtons, setShowPayPalButtons] = React.useState(false);

  // Form State
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  React.useEffect(() => {
    const storedDetails = localStorage.getItem('excursionBookingDetails');
    if (storedDetails) {
      try {
        setBookingDetails(JSON.parse(storedDetails));
      } catch (error) {
        console.error("Failed to parse booking details:", error);
      }
    }
    setIsLoading(false);
  }, []);

  const handleProceedToPayment = () => {
    if (!firstName || !lastName || !email || !phone || !termsAccepted) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and accept the terms.",
        variant: "destructive"
      });
      return;
    }
    setShowPayPalButtons(true);
  };

  const handlePaymentSuccess = async (paypalOrderId: string, paypalTransactionId: string) => {
    if (!bookingDetails) return;
    setIsProcessing(true);

    try {
      const payload = {
        type: 'excursion',
        customer: { name: `${firstName} ${lastName}`, email, phone },
        pricing: { totalUSD: bookingDetails.totalPrice, currency: 'USD' },
        guests: bookingDetails.mainExcursion.adults,
        details: {
          mainExcursion: bookingDetails.mainExcursion,
          bundledItems: bookingDetails.bundledItems,
          bundleDiscount: bookingDetails.bundleDiscount
        },
        status: 'Confirmed',
        paypalOrderId,
        paypalTransactionId,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast({ title: "Booking Confirmed", description: "Your adventure is booked!", variant: "default" });
        localStorage.removeItem('excursionBookingDetails');
        // Redirect to a generic confirmation or specific excursion confirmation
        router.push(`/confirmation?bid=${result.confirmationId}`);
      } else {
        throw new Error(result.error || 'Booking failed');
      }
    } catch (error: any) {
      console.error("Booking finalization failed:", error);
      toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setShowPayPalButtons(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment Error:", error);
    toast({ title: "Payment Error", description: "Please try again.", variant: "destructive" });
    setShowPayPalButtons(false);
  };

  const handlePaymentCancel = () => {
    toast({ title: "Payment Cancelled", description: "You cancelled the payment.", variant: "default" });
    setShowPayPalButtons(false);
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-shpc-sand">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-shpc-sand text-center p-4">
        <h2 className="text-2xl font-bold mb-2">Session Expired</h2>
        <p className="text-muted-foreground mb-4">Please select your excursion again.</p>
        <Button onClick={() => router.push('/excursions')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Browse Excursions
        </Button>
      </div>
    );
  }

  const { mainExcursion, bundledItems, totalPrice } = bookingDetails;

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-neutral-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-12">

        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="pl-0 hover:bg-transparent text-neutral-600 hover:text-shpc-yellow transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Left Column: Input & Security (Wider) */}
          <div className="lg:col-span-7 space-y-8">

            {/* Guest Information Card */}
            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-neutral-100 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-playfair text-shpc-ink">
                  <div className="bg-shpc-yellow/10 p-2 rounded-full">
                    <Lock className="h-5 w-5 text-shpc-yellow" />
                  </div>
                  Who's Joining Us?
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-neutral-700">First Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="firstName"
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12 bg-neutral-50 border-neutral-200 focus:border-shpc-yellow focus:ring-shpc-yellow/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-neutral-700">Last Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12 bg-neutral-50 border-neutral-200 focus:border-shpc-yellow focus:ring-shpc-yellow/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-neutral-700">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-neutral-50 border-neutral-200 focus:border-shpc-yellow focus:ring-shpc-yellow/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-neutral-700">Phone <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 bg-neutral-50 border-neutral-200 focus:border-shpc-yellow focus:ring-shpc-yellow/20"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg">
                  <Shield className="h-4 w-4 text-green-600" />
                  Your data is protected. We use this information only for essential tour updates.
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    className="mt-1 border-neutral-300 data-[state=checked]:bg-shpc-yellow data-[state=checked]:border-shpc-yellow"
                  />
                  <Label htmlFor="terms" className="text-sm text-neutral-600 font-normal leading-relaxed">
                    I agree to the <Link href="/privacy" className="underline hover:text-shpc-yellow">Privacy Statement</Link> and <Link href="/terms" className="underline hover:text-shpc-yellow">Terms of Service</Link>.
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Payment Security Card */}
            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-neutral-100 pb-6">
                <CardTitle className="flex items-center gap-3 text-xl font-playfair text-shpc-ink">
                  <div className="bg-blue-50 p-2 rounded-full">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  Payment Security
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  We use industry-leading encryption and do not store your credit card information. Your payment is processed securely via PayPal.
                </p>
                <div className="flex items-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
                  {/* Placeholder icons for cards - using lucide for now, ideally SVGs */}
                  <div className="flex gap-2">
                    <div className="h-8 w-12 bg-neutral-100 rounded flex items-center justify-center border border-neutral-200"><span className="text-[10px] font-bold text-neutral-500">VISA</span></div>
                    <div className="h-8 w-12 bg-neutral-100 rounded flex items-center justify-center border border-neutral-200"><span className="text-[10px] font-bold text-neutral-500">MC</span></div>
                    <div className="h-8 w-12 bg-neutral-100 rounded flex items-center justify-center border border-neutral-200"><span className="text-[10px] font-bold text-neutral-500">AMEX</span></div>
                  </div>
                  <div className="h-6 w-px bg-neutral-300 mx-2"></div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-neutral-500">
                    <Lock className="h-3 w-3" /> SSL Secure
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Experience Summary & Pricing */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="border-none shadow-lg bg-white rounded-2xl overflow-hidden sticky top-8">
              <CardHeader className="bg-shpc-ink text-white pb-8 pt-8">
                <CardTitle className="flex items-center gap-3 text-2xl font-playfair">
                  <span>🌴</span> Your Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">

                {/* Main Excursion Item */}
                <div className="flex gap-4">
                  <div className="relative h-20 w-24 rounded-lg overflow-hidden shrink-0 shadow-md">
                    <Image src={mainExcursion.image} alt={mainExcursion.title} fill className="object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-shpc-ink leading-tight">{mainExcursion.title}</h3>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Calendar className="h-4 w-4 text-shpc-yellow" />
                        <span>{format(parseISO(mainExcursion.bookingDate), 'EEEE, MMM dd')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Users className="h-4 w-4 text-shpc-yellow" />
                        <span>{mainExcursion.adults} Adults</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Clock className="h-4 w-4 text-shpc-yellow" />
                        <span>{mainExcursion.practicalInfo.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Clock className="h-4 w-4 text-shpc-yellow" />
                        <span>Pickup: {mainExcursion.practicalInfo.departure}</span>
                      </div>
                      <div className="pt-2">
                        <div className="flex items-start gap-2 text-sm text-neutral-600">
                          <MapPin className="h-4 w-4 text-shpc-yellow shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-shpc-ink block">Meeting Point:</span>
                            <span>{mainExcursion.practicalInfo.pickup}</span>
                            {mainExcursion.practicalInfo.pickupMapLink && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button className="block text-xs font-medium text-shpc-yellow hover:underline mt-1 text-left">
                                    View Map
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] bg-white p-0 overflow-hidden rounded-2xl">
                                  <DialogHeader className="p-6 pb-2">
                                    <DialogTitle className="font-playfair text-2xl">Walking Directions</DialogTitle>
                                  </DialogHeader>
                                  <div className="p-6 pt-2">
                                    <p className="text-sm text-muted-foreground mb-4">
                                      From <span className="font-semibold text-shpc-ink">Sweet Home Punta Cana</span> to <span className="font-semibold text-shpc-ink">{mainExcursion.practicalInfo.pickup}</span>
                                    </p>
                                    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-sm border border-neutral-200">
                                      <EmbeddedMap
                                        mapUrl={mainExcursion.practicalInfo.pickupMapLink}
                                        origin="Sweet Home Punta Cana"
                                        mode="walking"
                                        zoom={15}
                                      />
                                    </div>
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

                {/* Bundled Items */}
                {bundledItems.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-dashed border-neutral-200">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Bundled Add-ons</p>
                    {bundledItems.map(item => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative h-16 w-20 rounded-lg overflow-hidden shrink-0 shadow-sm">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-shpc-ink">{item.title}</h4>
                          <div className="space-y-1 mt-1">
                            <div className="flex items-center gap-2 text-xs text-neutral-600">
                              <Calendar className="h-3 w-3 text-shpc-yellow" />
                              <span>{format(parseISO(item.bookingDate), 'EEEE, MMM dd')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-600">
                              <Users className="h-3 w-3 text-shpc-yellow" />
                              <span>{item.adults} Adults</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-600">
                              <Clock className="h-3 w-3 text-shpc-yellow" />
                              <span>{item.practicalInfo.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-600">
                              <Clock className="h-3 w-3 text-shpc-yellow" />
                              <span>Pickup: {item.practicalInfo.departure}</span>
                            </div>
                            <div className="pt-1">
                              <div className="flex items-start gap-2 text-xs text-neutral-600">
                                <MapPin className="h-3 w-3 text-shpc-yellow shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-medium text-shpc-ink block">Meeting Point:</span>
                                  <span>{item.practicalInfo.pickup}</span>
                                  {item.practicalInfo.pickupMapLink && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <button className="block text-xs font-medium text-shpc-yellow hover:underline mt-0.5 text-left">
                                          View Map
                                        </button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[600px] bg-white p-0 overflow-hidden rounded-2xl">
                                        <DialogHeader className="p-6 pb-2">
                                          <DialogTitle className="font-playfair text-2xl">Walking Directions</DialogTitle>
                                        </DialogHeader>
                                        <div className="p-6 pt-2">
                                          <p className="text-sm text-muted-foreground mb-4">
                                            From <span className="font-semibold text-shpc-ink">Sweet Home Punta Cana</span> to <span className="font-semibold text-shpc-ink">{item.practicalInfo.pickup}</span>
                                          </p>
                                          <div className="aspect-video w-full rounded-xl overflow-hidden shadow-sm border border-neutral-200">
                                            <EmbeddedMap
                                              mapUrl={item.practicalInfo.pickupMapLink}
                                              origin="Sweet Home Punta Cana"
                                              mode="walking"
                                              zoom={15}
                                            />
                                          </div>
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
                    ))}
                  </div>
                )}



                <Separator />

                {/* Price Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">{mainExcursion.title} ({mainExcursion.adults}x)</span>
                    <span className="font-medium">${(mainExcursion.price.adult * mainExcursion.adults).toFixed(2)}</span>
                  </div>
                  {bundledItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-neutral-600">{item.title} ({item.adults}x)</span>
                      <span className="font-medium">${(item.price.adult * item.adults).toFixed(2)}</span>
                    </div>
                  ))}
                  {bookingDetails.bundleDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="font-medium">Bundle Savings</span>
                      <span className="font-medium">-${bookingDetails.bundleDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  All taxes & fees included. Guaranteed no hidden costs.
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Total (USD)</span>
                    <span className="text-4xl font-bold text-shpc-ink">${totalPrice.toFixed(2)}</span>
                  </div>

                  {!showPayPalButtons ? (
                    <Button
                      size="lg"
                      className="w-full h-14 bg-shpc-yellow hover:bg-shpc-yellow/90 text-shpc-ink font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                      onClick={handleProceedToPayment}
                    >
                      Proceed to Payment
                    </Button>
                  ) : (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <PayPalButtonsWrapper
                        amount={totalPrice.toFixed(2)}
                        currency="USD"
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                        onPaymentCancel={handlePaymentCancel}
                      />
                      <Button variant="ghost" className="w-full text-neutral-500 hover:text-neutral-800" onClick={() => setShowPayPalButtons(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Lock, Shield, Calendar, Users, Clock, Trash2, CheckCircle, Loader2, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { PayPalButtonsWrapper } from '@/components/PayPalButtonsWrapper';
import { useCartStore } from '@/store/use-cart-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EmbeddedMap from "@/components/embedded-map";

interface ExcursionCheckoutClientProps {
  googleMapsApiKey: string;
}

export default function ExcursionCheckoutClient({ googleMapsApiKey }: ExcursionCheckoutClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Cart Store
  const cartItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalPrice = useCartStore((state) => state.getTotalPrice());

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showPayPalButtons, setShowPayPalButtons] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Form State
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-shpc-sand" />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-shpc-sand text-center p-4">
        <h2 className="text-2xl font-bold mb-2 font-playfair text-shpc-ink">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven't added any adventures yet.</p>
        <Button onClick={() => router.push('/excursions')} className="bg-shpc-yellow text-shpc-ink font-bold">
          <ArrowLeft className="mr-2 h-4 w-4" /> Browse Excursions
        </Button>
      </div>
    );
  }

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
    setIsProcessing(true);

    try {
      // Create payload for MULTIPLE items
      // We will loop through cart items and create a booking for each? 
      // Or create one unified booking record?
      // Since backend structure likely expects single booking or list.
      // Let's assume we send a list of bookings to create.

      // Actually, existing api/bookings route likely handles single booking object.
      // We should probably modify server action to handle array or loop here.
      // For robustness, let's call a new server action or API that handles the cart batch.
      // Or for now, we loop through items and create bookings sequentially (simplest MVP).
      // Ideally, we transactionally do it.

      const payload = {
        type: 'cart_checkout', // New type handler in API? Or we just iterate
        customer: { name: `${firstName} ${lastName}`, email, phone },
        items: cartItems.map(item => ({
          excursionId: item.excursionId,
          date: item.date,
          adults: item.passengers.adults,
          children: item.passengers.children,
          totalPrice: item.totalPrice,
          title: item.title,
          image: item.image,
          // Pass any other details needed for email
        })),
        pricing: { totalUSD: totalPrice, currency: 'USD' },
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
        toast({ title: "Booking Confirmed", description: "Your adventures are booked!", variant: "default" });
        clearCart();
        // Redirect to confirmation with Order ID or IDs
        router.push(`/confirmation/excursions?bid=${result.confirmationId}`);
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

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-neutral-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-12">

        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/excursions')}
            className="pl-0 hover:bg-transparent text-neutral-600 hover:text-shpc-yellow transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
          </Button>
        </div>

        <h1 className="text-3xl lg:text-4xl font-playfair font-bold text-shpc-ink mb-8">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-neutral-100 pb-6">
                <CardTitle className="flex items-center gap-3 text-xl font-playfair text-shpc-ink">
                  <span>🛒</span> Your Cart ({cartItems.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="group relative">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative aspect-video sm:w-32 sm:h-24 rounded-lg overflow-hidden shrink-0 shadow-sm">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="flex-grow space-y-1">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-bold text-lg text-shpc-ink leading-tight">{item.title}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 -mr-2"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-shpc-yellow" />
                            <span>{format(parseISO(item.date), 'EEE, MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-shpc-yellow" />
                            <span>{item.passengers.adults} Adults {item.passengers.children > 0 && `, ${item.passengers.children} Children`}</span>
                          </div>
                        </div>
                        <div className="pt-2 flex justify-between items-end">
                          {/* Could show price breakdown here */}
                          <p className="text-sm text-muted-foreground">
                            ${item.pricePerAdult} x {item.passengers.adults} {item.passengers.children > 0 && `+ $${item.pricePerChild} x ${item.passengers.children}`}
                          </p>
                          <p className="font-bold text-lg text-shpc-ink">${item.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <Separator className="mt-6 last:hidden" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-neutral-100 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-playfair text-shpc-ink">
                  <div className="bg-shpc-yellow/10 p-2 rounded-full">
                    <Lock className="h-5 w-5 text-shpc-yellow" />
                  </div>
                  Main Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-12 bg-neutral-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-12 bg-neutral-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 bg-neutral-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 bg-neutral-50" />
                  </div>
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
          </div>

          {/* Right Column: Order Summary & Payment */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="border-none shadow-lg bg-white rounded-2xl overflow-hidden sticky top-8">
              <CardHeader className="bg-shpc-ink text-white pb-8 pt-8">
                <CardTitle className="flex items-center gap-3 text-2xl font-playfair">
                  Total Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Taxes & Fees</span>
                    <span>Included</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-end mb-6">
                  <span className="text-lg font-bold text-shpc-ink">Total (USD)</span>
                  <span className="text-4xl font-bold text-shpc-ink">${totalPrice.toFixed(2)}</span>
                </div>

                {!showPayPalButtons ? (
                  <Button
                    size="lg"
                    className="w-full h-14 bg-shpc-yellow hover:bg-shpc-yellow/90 text-shpc-ink font-bold text-lg shadow-lg"
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
                    <Button variant="ghost" className="w-full" onClick={() => setShowPayPalButtons(false)}>
                      Cancel
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 pt-4">
                  <Lock className="h-3 w-3" /> Secure SSL Encryption
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

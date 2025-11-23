'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; // Import useRouter

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// The corrected, client-side only PayPal component
import { PayPalButtonsWrapper } from '@/components/PayPalButtonsWrapper';

const PRICE_PER_BAG = 35; // Price in USD
const CURRENCY = 'USD'; // Currency for the transaction

export default function LaundryServicePage() {
    const { toast } = useToast();
    const router = useRouter(); // Initialize the router
    const [bags, setBags] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showPaypal, setShowPaypal] = useState(false);

    const amount = (bags * PRICE_PER_BAG).toFixed(2);

    const handleProceed = () => {
        if (bags > 0) {
            setIsLoading(true);
            setShowPaypal(true);
        } else {
            toast({
                title: "Invalid quantity",
                description: "Please enter a valid number of bags.",
                variant: "destructive"
            });
        }
    };

    const onPaymentSuccess = (paypalOrderId: string, paypalTransactionId: string) => {
        console.log(`Payment successful! Order ID: ${paypalOrderId}, Transaction ID: ${paypalTransactionId}`);
        toast({
            title: 'Payment Successful!',
            description: 'Redirecting to confirmation page...',
        });

        // Redirect to the confirmation page with the order ID
        router.push(`/laundry-service/confirmation?orderId=${paypalOrderId}`);

        // Reset state after redirection logic
        setShowPaypal(false);
        setIsLoading(false);
        setBags(1);
    };

    const onPaymentError = (err: any) => {
        console.error('PayPal Error:', err);
        toast({
            title: 'Payment Failed',
            description: 'An error occurred with the PayPal transaction.',
            variant: 'destructive'
        });
        setShowPaypal(false);
        setIsLoading(false);
    };

    const onPaymentCancel = () => {
        console.log('PayPal payment cancelled');
        toast({
            title: 'Payment Cancelled',
            description: 'You have cancelled the payment.',
        });
        setShowPaypal(false);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-shpc-sand text-neutral-900">
            <section className="relative overflow-hidden bg-shpc-ink">
                <div className="absolute inset-0">
                    <Image
                        src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/laundry%20service%20guest%20services%20sweet%20home%20punta%20cana.png?alt=media&token=f82dc09e-4fe6-45f4-bb76-aaf099ec9de0"
                        alt="Laundry service background"
                        fill
                        sizes="100vw"
                        style={{ objectFit: 'cover' }}
                        className="opacity-50"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-shpc-ink via-shpc-ink/70 to-transparent" />
                </div>
                <div className="relative mx-auto max-w-4xl px-6 py-24 text-center text-white">
                    <h1 className="text-4xl font-semibold">Laundry Service</h1>
                    <p className="mt-3 text-lg">Travel light. Let us handle the laundry.</p>
                </div>
            </section>

            <section className="mx-auto max-w-2xl px-6 py-12">
                <Card className="rounded-3xl bg-white p-4 sm:p-8 shadow-soft">
                    <CardHeader>
                        <CardTitle>Schedule a Pickup</CardTitle>
                        <CardDescription>
                            Our professional wash & fold service. Price is ${PRICE_PER_BAG} per bag.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!showPaypal ? (
                            <div className="space-y-2">
                                <Label htmlFor="bags">Number of Bags</Label>
                                <Input
                                    id="bags"
                                    type="number"
                                    value={bags}
                                    onChange={(e) => setBags(parseInt(e.target.value, 10) || 1)}
                                    min="1"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="mb-4">Total Amount: <strong>${amount}</strong></p>
                                <PayPalButtonsWrapper
                                    amount={amount}
                                    currency={CURRENCY}
                                    onPaymentSuccess={onPaymentSuccess}
                                    onPaymentError={onPaymentError}
                                    onPaymentCancel={onPaymentCancel}
                                />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        {!showPaypal && (
                            <Button size="lg" className="w-full" onClick={handleProceed} disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                                {isLoading ? 'Preparing...' : `Proceed to Pay $${amount}`}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </section>
        </div>
    );
}

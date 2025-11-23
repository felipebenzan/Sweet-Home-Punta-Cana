'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function TransferConfirmationPage() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bid');

    return (
        <div className="min-h-screen bg-shpc-sand flex items-center justify-center p-4">
            <Card className="w-full max-w-lg text-center p-6 sm:p-8 shadow-soft rounded-3xl">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="mt-4 text-3xl font-bold">Booking Confirmed!</CardTitle>
                    <CardDescription className="mt-2 text-lg text-muted-foreground">
                        Your airport transfer has been successfully booked.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {bookingId && (
                        <div className="text-sm text-muted-foreground bg-gray-50 p-4 rounded-lg">
                            <p>Your Booking Reference ID is:</p>
                            <p className="font-mono text-xs sm:text-sm break-all mt-1">{bookingId}</p>
                        </div>
                    )}
                    <p>You will receive a confirmation email with all the details shortly. Please check your spam folder just in case.</p>
                     <div className="text-left text-sm space-y-2 border-t pt-4">
                        <p className="font-semibold">What happens next?</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li>We will verify your flight details.</li>
                            <li>Your driver will meet you at the airport arrivals exit with a sign bearing your name.</li>
                            <li>If you booked a departure, your driver will meet you at the property at the scheduled time.</li>
                        </ul>
                    </div>
                    <div className="border-t pt-4">
                         <p className="font-semibold">Have questions?</p>
                         <p className="text-muted-foreground text-sm mt-1 mb-3">You can contact us anytime.</p>
                         <div className="flex flex-col sm:flex-row gap-3 justify-center">
                             <Button asChild variant="outline" size="lg">
                               <a href="https://wa.me/18095105465" target="_blank" rel="noopener noreferrer">
                                   <Phone className="mr-2 h-4 w-4"/> WhatsApp
                               </a>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                               <a href="mailto:info@sweethomepuntacana.com">
                                   <Mail className="mr-2 h-4 w-4"/> Email Us
                               </a>
                            </Button>
                         </div>
                    </div>
                    <div className="mt-6">
                        <Button asChild size="lg">
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

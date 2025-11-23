'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function LaundryConfirmationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div className="min-h-screen bg-shpc-sand flex items-center justify-center p-4">
            <Card className="w-full max-w-lg text-center p-6 sm:p-8 shadow-soft rounded-3xl">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="mt-4 text-3xl font-bold">Payment Successful!</CardTitle>
                    <CardDescription className="mt-2 text-lg text-muted-foreground">
                        Your laundry service has been scheduled.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {orderId && (
                        <div className="text-sm text-muted-foreground bg-gray-50 p-4 rounded-lg">
                            <p>Your PayPal Order ID is:</p>
                            <p className="font-mono text-xs sm:text-sm break-all mt-1">{orderId}</p>
                        </div>
                    )}
                    <p>We'll be in touch shortly to coordinate the pickup of your laundry bags. If you have any immediate questions, feel free to contact us.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button asChild size="lg">
                            <Link href="/">Back to Home</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                           <a href="https://wa.me/18095105465" target="_blank" rel="noopener noreferrer">Contact on WhatsApp</a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/use-cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn exists, typical in shadcn projects

export function CartSidebar() {
    const items = useCartStore((state) => state.items);
    const removeItem = useCartStore((state) => state.removeItem);
    const totalPrice = useCartStore((state) => state.getTotalPrice());
    const [mounted, setMounted] = React.useState(false);

    // Hydration fix
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || items.length === 0) {
        return null;
    }

    return (
        <div className="hidden lg:block w-80 shrink-0 sticky top-24 h-fit animate-in slide-in-from-left-4 fade-in duration-300">
            <Card className="border-shpc-yellow/20 shadow-lg overflow-hidden">
                <div className="bg-shpc-ink text-white p-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-shpc-yellow" />
                    <h3 className="font-playfair font-bold text-lg">Your Itinerary</h3>
                </div>
                <CardContent className="p-4 space-y-4">
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                        {items.map((item) => (
                            <div key={item.id} className="relative group">
                                <div className="flex gap-3 items-start">
                                    <div className="relative h-16 w-16 rounded-md overflow-hidden shrink-0">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="space-y-1 flex-grow min-w-0">
                                        <p className="font-medium text-sm leading-tight line-clamp-2" title={item.title}>
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                                            <span className="text-muted-foreground">({item.passengers.adults + item.passengers.children} guests)</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                    <span className="sr-only">Remove</span>
                                </Button>
                                <Separator className="mt-4" />
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-muted-foreground">Total</span>
                            <span className="text-2xl font-bold text-shpc-ink">${totalPrice.toFixed(2)}</span>
                        </div>
                        <Button asChild className="w-full bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 font-bold">
                            <Link href="/checkout/excursions">
                                Complete Booking <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

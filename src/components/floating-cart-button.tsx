'use client';

import * as React from 'react';
import { ShoppingCart, X, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/use-cart-store';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export function FloatingCartButton() {
    const items = useCartStore((state) => state.items);
    const removeItem = useCartStore((state) => state.removeItem);
    const totalPrice = useCartStore((state) => state.getTotalPrice());
    const [mounted, setMounted] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || items.length === 0) {
        return null;
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    size="icon"
                    className={cn(
                        "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 animate-in zoom-in-0 duration-300",
                        // "md:hidden" // User didn't say only mobile. They said "global component". 
                        // But usually redundant if sidebar exists. I'll leave it global as requested.
                    )}
                >
                    <ShoppingCart className="h-6 w-6" />
                    <span className="sr-only">Open Cart</span>
                    {items.length > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                            {items.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col h-full w-full sm:max-w-md p-0">
                <SheetHeader className="p-6 pb-2 border-b">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-shpc-yellow" />
                        <SheetTitle className="font-playfair font-bold text-xl">Your Cart</SheetTitle>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.map((item) => (
                        <div key={item.id} className="relative flex gap-4">
                            <div className="relative h-20 w-20 rounded-md overflow-hidden shrink-0 border border-neutral-100">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                                <h4 className="font-medium font-playfair text-shpc-ink leading-tight line-clamp-2 pr-6">
                                    {item.title}
                                </h4>
                                <div className="text-sm text-neutral-500">
                                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="text-sm font-semibold flex items-center justify-between pt-1">
                                    <span>${item.totalPrice.toFixed(2)}</span>
                                    <span className="text-xs font-normal text-muted-foreground">
                                        {item.passengers.adults} Adults
                                        {item.passengers.children > 0 && `, ${item.passengers.children} Kids`}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => removeItem(item.id)}
                                className="absolute top-0 right-0 text-neutral-400 hover:text-red-500 transition-colors p-1"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove</span>
                            </button>
                        </div>
                    ))}
                    {/* No Items handling handled by main return null, but technically if user deletes all items while open?
                         The loop handles it, empty list. But parent return null usually unmounts component. 
                         If items become empty, component unmounts -> Sheet disappears. Correct. */}
                </div>

                <div className="p-6 border-t bg-neutral-50 space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-base font-medium text-muted-foreground">Total</span>
                        <span className="text-3xl font-bold text-shpc-ink">${totalPrice.toFixed(2)}</span>
                    </div>
                    <Button
                        asChild
                        className="w-full bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 font-bold h-12 text-lg"
                        onClick={() => setIsOpen(false)}
                    >
                        <Link href="/checkout/excursions">
                            Checkout Now <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

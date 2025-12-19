'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ShoppingCart } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/use-cart-store';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/guest-services', label: 'Guest Services' },
  { href: '/excursions', label: 'Excursions' },
  { href: '/location', label: 'Find Us' },
];

import { useScrollDirection } from '@/hooks/use-scroll-direction';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const cartCount = mounted ? cartItems.reduce((acc, item) => acc + (item.type === 'excursion' ? 1 : 0), 0) : 0;
  // Actually, item count usually means number of distinct items or total quantity? 
  // Let's use length of items array for simplicity as structure is 1 item per addition.
  const displayCount = mounted ? cartItems.length : 0;

  return (
    <header className="h-[var(--header-height)]">
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-40 h-[var(--header-height)] bg-white/95 backdrop-blur-md transition-transform duration-300 border-b border-border/40",
          scrollDirection === 'down' ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 h-full">
          <div className="relative flex h-full items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5 transition-opacity hover:opacity-80">
              <span className="sr-only">Sweet Home Punta Cana</span>
              <Image
                className="h-20 w-auto"
                src="/sweet-home-logo-2.png"
                alt="Sweet Home Punta Cana"
                width={400}
                height={120}
                priority
              />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-neutral-600 transition-colors hover:text-shpc-ink"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/checkout/excursions"
                className="flex items-center gap-2 text-neutral-600 transition-colors hover:text-shpc-ink font-semibold"
              >
                <ShoppingCart className="h-4 w-4" />
                Cart
                {displayCount > 0 && (
                  <span className="bg-shpc-yellow text-shpc-ink text-[10px] font-bold px-1.5 py-0.5 rounded-full -ml-1">
                    {displayCount}
                  </span>
                )}
              </Link>
            </nav>
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <div className="relative">
                      <Menu className="h-6 w-6" />
                      {displayCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-shpc-yellow rounded-full border border-white" />
                      )}
                    </div>
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-6 mt-8 overflow-y-auto max-h-[calc(100vh-100px)] pb-8">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg font-medium text-neutral-600 transition-colors hover:text-shpc-ink block py-2"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <Link
                      href="/checkout/excursions"
                      className="text-lg font-medium text-shpc-ink transition-colors hover:text-shpc-yellow block py-2 flex items-center gap-2"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Cart
                      {displayCount > 0 && (
                        <span className="bg-shpc-yellow text-shpc-ink text-xs font-bold px-2 py-0.5 rounded-full">
                          {displayCount} item{displayCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/rooms', label: 'Rooms' },
  { href: '/guest-services', label: 'Guest Services' },
  { href: '/excursions', label: 'Excursions' },
  { href: '/location', label: 'Find Us' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="h-[var(--header-height)]">
      <div className="max-w-6xl mx-auto px-6 h-full">
        <div className="relative flex h-full items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="Sweet Home Punta Cana Home">
            <Image
                src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/Sweet%20Home%20Punta%20Cana%20logo.png?alt=media&token=2daf1c25-1bb0-4f7e-9fd2-598f30501843"
                alt="Sweet Home Punta Cana Logo"
                width={1080}
                height={288}
                className="object-contain h-16 w-auto"
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
          </nav>
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-6 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium text-neutral-600 transition-colors hover:text-shpc-ink"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

    
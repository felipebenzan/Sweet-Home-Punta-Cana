
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import HeaderManager from '@/components/header-manager';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { FirebaseErrorListener } from './FirebaseErrorListener';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const CURRENCY = 'USD';

const pagesWithPadding = [
  '/faqs',
  '/privacy',
  '/rules',
  '/terms',
  '/terms/excursions',
  '/terms/transfers',
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isTestPage = pathname === '/paypal-test';
  
  const isBookingFlowPage = [
    '/laundry-service',
    '/airport-transfer',
    '/checkout',
    '/checkout/excursions',
    '/confirmation',
    '/confirmation/excursions',
    '/laundry-service/confirmation',
    '/airport-transfer/confirmation',
  ].some(p => pathname.startsWith(p));


  return (
    <FirebaseClientProvider>
      <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID, currency: CURRENCY }}>
        <FirebaseErrorListener />

        {isAdminPage || isTestPage ? (
          <main className="flex-grow">{children}</main>
        ) : isBookingFlowPage ? (
          <>
            <Header />
            <main
              className="flex-grow bg-shpc-sand pt-[var(--header-height)]"
            >
              {children}
            </main>
            <Footer />
          </>
        ) : (
          <>
            <HeaderManager>
              <Header />
              <main
                className={cn(
                  "flex-grow bg-shpc-sand",
                  pagesWithPadding.includes(pathname) && "pt-[var(--header-height)]"
                )}
              >
                {children}
              </main>
            </HeaderManager>
            <Footer />
          </>
        )}
      </PayPalScriptProvider>
    </FirebaseClientProvider>
  );
}

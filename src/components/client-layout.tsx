'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { usePathname } from 'next/navigation';
import HeaderManager from '@/components/header-manager';
import { PayPalProvider } from '@/components/paypal-provider';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if we are in the booking flow or admin pages
  const isBookingFlowPage = [
    '/checkout',
    '/booking-confirmation',
    '/admin'
  ].some(path => pathname?.startsWith(path));

  // Check if we are on the search page (needs header)
  const isSearchPage = pathname?.startsWith('/search');

  // Admin pages have their own layout
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  // Checkout pages might want a simplified header or no header
  if (isBookingFlowPage && !isSearchPage) {
    return (
      <PayPalProvider>
        <main className="flex-grow flex flex-col min-h-screen bg-shpc-sand">
          {children}
        </main>
      </PayPalProvider>
    );
  }

  return (
    <PayPalProvider>
      <div className="flex flex-col min-h-screen">
        <HeaderManager>
          <div
            id="main-header"
            className="fixed top-0 left-0 right-0 z-[1000] bg-white transition-transform duration-300 ease-in-out will-change-transform"
          >
            <Header />
          </div>
          <main className="flex-grow flex flex-col min-h-screen pt-[var(--header-height)] bg-shpc-sand relative z-0">
            {children}
          </main>
        </HeaderManager>
        <Footer />
      </div>
    </PayPalProvider>
  );
}

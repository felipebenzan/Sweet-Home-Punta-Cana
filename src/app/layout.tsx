
import Script from 'next/script'; // Added for Google Analytics
import type { Metadata } from 'next';
import { Inter, Playfair_Display, Dancing_Script } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import ClientLayout from '@/components/client-layout';
import { FloatingCartButton } from '@/components/floating-cart-button';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair-display' });
const dancingScript = Dancing_Script({ subsets: ['latin'], variable: '--font-dancing-script', weight: '700' });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sweet Home Punta Cana | Adults-Only Guest House Near Bávaro Beach',
  description: 'Discover an affordable, adults-only guest house in Punta Cana, just minutes from Bávaro Beach. Enjoy private rooms, A/C, Wi-Fi, and personalized services like airport transfers and excursions. The perfect alternative to expensive resorts and noisy hostels.',
  keywords: ['punta cana guest house', 'bavaro beach accommodation', 'adults-only punta cana', 'budget hotel punta cana', 'hostel punta cana private room', 'punta cana airport transfer', 'isla saona tour', 'cheap stay punta cana'],
  openGraph: {
    title: 'Sweet Home Punta Cana | Adults-Only Guest House Near Bávaro Beach',
    description: 'Affordable, private, and perfectly located. Your home away from home in paradise.',
    type: 'website',
    url: 'https://www.sweethomepc.com',
    images: [
      {
        url: 'https://www.sweethomepc.com/sweet-home-logo-2.png',
        width: 1200,
        height: 630,
        alt: 'Sweet Home Punta Cana',
      },
    ],
  },
  icons: {
    icon: '/official-favicon.png?v=3',
    shortcut: '/official-favicon.png?v=3',
    apple: '/official-favicon.png?v=3',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/official-favicon.png?v=3',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={cn('antialiased font-sans flex flex-col min-h-screen', inter.variable, playfairDisplay.variable, dancingScript.variable)}>
        {/* EMERGENCY: Hardcoded Live ID from User Text Copy-Paste */}
        <ClientLayout paypalClientId="AdcvZIs6aDhOuAfazd6S-6BQJYWY_o0_RqXiVfVeIuirgbUj1lrC-Vc6kDBDD0H5lqpgGlTrGhf6kyFN">
          {children}
        </ClientLayout>
        <FloatingCartButton />
        <Toaster />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LXB0EHV9DQ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-LXB0EHV9DQ');
          `}
        </Script>
      </body>
    </html>
  );
}


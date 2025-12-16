
import type { Metadata } from 'next';
import { Inter, Playfair_Display, Dancing_Script } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import ClientLayout from '@/components/client-layout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair-display' });
const dancingScript = Dancing_Script({ subsets: ['latin'], variable: '--font-dancing-script', weight: '700' });

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={cn('antialiased font-sans flex flex-col min-h-screen', inter.variable, playfairDisplay.variable, dancingScript.variable)}>
        <ClientLayout paypalClientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || ""}>
          {children}
        </ClientLayout>
        <Toaster />
      </body>
    </html>
  );
}


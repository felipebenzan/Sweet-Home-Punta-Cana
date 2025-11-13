

'use client';

import React from 'react';
import { ArrowRight, ExternalLink, Info, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const deliveryApps = [
  {
    name: 'PedidosYa',
    logo: 'https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/pedidos-ya-logo-png_seeklogo-369550.png?alt=media&token=b68381e7-e377-4197-9e46-2156fb4f35ed',
    href: 'https://www.pedidosya.com.do/',
    description: 'The most popular delivery app in the Dominican Republic, offering a wide range of restaurants and groceries.',
  },
  {
    name: 'Uber Eats',
    logo: 'https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/Uber%20eats%20logo%20sweet%20home%20punta%20cana.png?alt=media&token=e04a4dc6-3802-40e4-af39-39454331a5ee',
    href: 'https://www.ubereats.com/',
    description: 'A global favorite, with many well-known and local food chains available for delivery.',
  },
];

const ADDRESS = 'Sweet Home Punta Cana, Bavaro, Punta Cana 23000, Dominican Republic';

export default function FoodDeliveryPage() {
  return (
    <div className="bg-white text-shpc-ink">
      {/* Hero Section */}
      <section className="relative h-[50vh] w-full flex items-center justify-center text-center text-white bg-black">
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/restaurant%20delivery%20sweet%20home%20punta%20cana%20uber%20eats%20pedidos%20ya.png?alt=media&token=67923149-64f4-428d-9eb3-6f8de0190a6b"
          alt="Food delivery options in Punta Cana"
          fill
          priority
          className="object-cover opacity-50"
          data-ai-hint="food delivery"
        />
        <div className="relative z-10 p-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair font-bold">
            Your Cravings, Delivered
          </h1>
          <p className="mt-6 text-base md:text-lg font-light max-w-3xl mx-auto">
            Enjoy the best local and international cuisine from the comfort of your room. We make it easy to order from top delivery services.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-24 space-y-16">
        <section className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4">How It Works</h2>
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
                Getting your favorite food is simple. Just choose an app, set your location to Sweet Home Punta Cana, and browse endless options.
            </p>
        </section>

        {/* Address Info */}
        <section className="p-6 bg-shpc-sand rounded-2xl shadow-soft border border-shpc-edge">
             <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-primary"/>
                </div>
                <div className="text-center sm:text-left flex-grow">
                    <h3 className="font-semibold">Your Delivery Address</h3>
                    <p className="text-sm text-muted-foreground">{ADDRESS}</p>
                </div>
                <Button 
                    onClick={() => navigator.clipboard.writeText(ADDRESS)}
                    className="w-full sm:w-auto shrink-0"
                >
                    Copy Address
                </Button>
            </div>
        </section>

        {/* Delivery App Links */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {deliveryApps.map((app) => (
            <Card key={app.name} className="shadow-lg rounded-2xl overflow-hidden group">
                <CardContent className="p-8 text-center flex flex-col items-center justify-between h-full">
                    <div className="flex-grow">
                        <Image src={app.logo} alt={`${app.name} logo`} width={120} height={40} className="object-contain mx-auto mb-6" />
                        <p className="text-muted-foreground text-sm">{app.description}</p>
                    </div>
                    <Button asChild size="lg" className="mt-6 w-full rounded-full">
                        <a href={app.href} target="_blank" rel="noopener noreferrer">
                        Order on {app.name} <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                </CardContent>
            </Card>
          ))}
        </section>

        {/* Mini-Market Promo Section */}
        <section>
          <div className="relative rounded-2xl shadow-soft overflow-hidden bg-shpc-ink text-white">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/mini%20market%20colmado%20delivery%20sweet%20home%20punta%20cana.png?alt=media&token=01e1d92c-8c23-4264-9646-3181a8c87fc0"
              alt="A paper bag full of fresh groceries"
              fill
              className="object-cover opacity-40"
              data-ai-hint="grocery bag"
            />
            <div className="relative p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold font-playfair">Need Groceries Instead?</h2>
                <p className="mt-4 text-lg text-white/80">
                  Get essentials like water, snacks, beer, and more delivered in minutes from the local colmado.
                </p>
              </div>
              <Button asChild size="lg" className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 shrink-0">
                <Link href="/minimarket-delivery">
                  Order Essentials <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

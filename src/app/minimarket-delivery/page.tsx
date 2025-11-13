
'use client';

import React from 'react';
import { ArrowRight, Phone, Check, Info, Droplets, ShoppingBasket, Sun, Package, Sparkles, Clock, DollarSign, Handshake, Utensils, GlassWater, Wind } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import EmbeddedMap from '@/components/embedded-map';
import Link from 'next/link';

const COLMADO_MAP_URL = "https://www.google.com/maps/dir/Sweet+Home+Punta+Cana/Mini+market+La+Bodega,+MH8P+9MQ,+Punta+Cana+23000,+Dominican+Republic";

const whatYoullFind = [
  { icon: <Sparkles />, title: "Cleaning & Laundry", description: "Detergent, paper goods, everyday essentials" },
  { icon: <Package />, title: "Pantry Staples", description: "Rice, pasta, canned goods, oil" },
  { icon: <GlassWater />, title: "Drinks & Refreshments", description: "Water, juices, ice-cold beer, wine" },
  { icon: <Utensils />, title: "Snacks", description: "Chips, cookies, nuts, chocolate" },
  { icon: <Droplets />, title: "Personal Care", description: "Soap, shampoo, toothpaste" },
  { icon: <Sun />, title: "Extras", description: "Ice, cigarettes, OTC basics" },
];

export default function MiniMarketDeliveryPage() {
    const howItWorks = [
      {
        icon: <Phone />,
        title: "Call or WhatsApp",
        text: 'Place your order quickly and easily.',
        contact: "+1 (829) 530-1777"
      },
      {
        icon: <Clock />,
        title: "Fast Delivery",
        text: 'Usually arrives in 10–25 minutes.',
      },
      {
        icon: <DollarSign />,
        title: "Cash Only",
        text: 'Simple, direct, and convenient.',
      },
      {
        icon: <Handshake />,
        title: "Tipping Matters",
        text: 'In the Dominican Republic, tipping your rider is part of the service.',
      },
    ];

  return (
    <div className="bg-white text-shpc-ink">
      {/* Hero Section */}
      <section className="relative h-[50vh] w-full flex items-center justify-center text-center text-white bg-black">
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/mini%20market%20colmado%20delivery%20sweet%20home%20punta%20cana.png?alt=media&token=01e1d92c-8c23-4264-9646-3181a8c87fc0"
          alt="A paper bag full of fresh groceries"
          fill
          priority
          className="object-cover opacity-50"
          data-ai-hint="grocery bag"
        />
        <div className="relative z-10 p-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair font-bold">
            Mini Market (Colmado)
          </h1>
          <p className="mt-6 text-base md:text-lg font-light max-w-3xl mx-auto">
            Everything you need, delivered fast.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-24 space-y-24">

        {/* Intro */}
        <section className="text-center max-w-3xl mx-auto">
            <p className="text-lg md:text-xl leading-relaxed text-neutral-700">
                Your neighborhood mini market, known locally as a colmado, is just around the corner. From essentials and cleaning supplies to ice-cold beer, rum, and snacks — everything can be delivered straight to Sweet Home.
            </p>
        </section>
        
        {/* How It Works */}
        <section>
            <h2 className="text-3xl md:text-4xl font-semibold font-playfair mb-8 text-center tracking-tight text-neutral-800/90" style={{ fontWeight: 400 }}>How It Works</h2>
             <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
                {howItWorks.map((item, index) => (
                    <div key={index} className="p-6 bg-shpc-sand/50 rounded-2xl flex flex-col items-center text-center h-full transition-all hover:bg-shpc-sand hover:shadow-soft">
                        <div className="text-primary mb-4">
                          {React.cloneElement(item.icon, { className: "h-7 w-7", strokeWidth: 1.5 })}
                        </div>
                        <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                        <p className="text-neutral-600 text-sm leading-relaxed tracking-wide flex-grow" style={{ letterSpacing: '0.01em', lineHeight: 1.6 }}>{item.text}</p>
                         {item.contact && (
                            <a href={`https://wa.me/${item.contact.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary mt-2 hover:underline">{item.contact}</a>
                        )}
                    </div>
                ))}
            </div>
        </section>

        {/* Location */}
        <section>
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4">Location</h2>
                <p className="text-lg md:text-xl leading-relaxed text-neutral-700 mb-8">
                    The nearest colmado is Mini Market La Bodega, just a short walk from Sweet Home Punta Cana.
                </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-soft h-96">
                <EmbeddedMap mapUrl={COLMADO_MAP_URL} mode="walking" />
            </div>
        </section>
        
        {/* What You'll Find */}
        <section>
            <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-8 text-center">What You'll Find</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 max-w-2xl mx-auto">
                {whatYoullFind.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className="text-shpc-yellow mt-1">
                            {React.cloneElement(item.icon, { className: "h-5 w-5", strokeWidth: 2 })}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{item.title}</h3>
                            <p className="text-neutral-500 text-sm">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
             <p className="text-center text-sm text-neutral-500 mt-12 italic">If you don’t see it, ask — colmados usually find a way.</p>
        </section>

        {/* Closing Note */}
        <section className="text-center max-w-3xl mx-auto">
             <p className="text-lg md:text-xl leading-relaxed text-neutral-700">
                Fast, convenient, and local — your colmado is the easiest way to get what you need during your stay.
            </p>
        </section>

        <section>
          <div className="relative rounded-2xl shadow-soft overflow-hidden bg-shpc-ink text-white">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/restaurant%20delivery%20sweet%20home%20punta%20cana%20uber%20eats%20pedidos%20ya.png?alt=media&token=67923149-64f4-428d-9eb3-6f8de0190a6b"
              alt="A delicious meal from a food delivery service"
              fill
              className="object-cover opacity-40"
              data-ai-hint="food delivery meal"
            />
            <div className="relative p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold font-playfair">Explore More Dining Options</h2>
                <p className="mt-4 text-lg text-white/80">
                  Craving something different? Order from dozens of local and international restaurants with apps like PedidosYa and Uber Eats.
                </p>
              </div>
              <Button asChild size="lg" className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 shrink-0">
                <Link href="/food-delivery">
                  See Food Delivery Apps <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


'use client';

import { useState } from "react";
import { MapPin, Car, Bus, Plane, ExternalLink, Copy, Phone, MessageCircle, Info, ArrowRight } from "lucide-react";
import Link from 'next/link';
import EmbeddedMap from "@/components/embedded-map";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";


// 🔧 QUICK SETUP NOTES
const ADDRESS_TEXT = "Sweet Home Punta Cana, Bavaro, Punta Cana 23000, Dominican Republic";
const WHATSAPP_NUMBER = "+1-809-510-5465";

const tabs = [
  { id: "taxi", label: "Taxi / Uber / Private", icon: Car },
  { id: "public", label: "Public Transport", icon: Bus },
  { id: "rental", label: "Rental Car", icon: Car },
];

interface FindUsClientProps {
  googleMapsApiKey: string;
}

export default function FindUsClient({ googleMapsApiKey }: FindUsClientProps) {
  const [mode, setMode] = useState("taxi");
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Address Copied!");
    } catch {
      alert("Could not copy. Please try manually.");
    }
  };

  return (
    <div className="bg-shpc-sand text-shpc-ink">
      {/* Hero Section */}
      <section className="relative h-[50vh] w-full flex items-center justify-center text-center text-white bg-black">
        <Image
          src="/find%20us%20hero.jpg"
          alt="Aerial view of a tropical coastline in Punta Cana"
          fill
          priority
          className="object-cover opacity-40"
          data-ai-hint="tropical coastline aerial"
        />
        <div className="relative z-10 p-6">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold">
            Find Us ✨
          </h1>
          <p className="mt-4 text-lg md:text-2xl font-light">
            The journey to paradise is simpler than you think.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24 space-y-16">
        {/* Address Section */}
        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-left">
            <h2 className="font-playfair text-3xl md:text-4xl leading-tight">{ADDRESS_TEXT}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button asChild className="rounded-full justify-start bg-[#4285F4] hover:bg-[#3572E1] text-white"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS_TEXT)}`} target="_blank" rel="noopener noreferrer"><Image src="/google-maps-logo.png" alt="Google Maps" width={96} height={96} className="mr-2 h-10 w-10 object-contain" /> Google Maps</a></Button>
            <Button asChild className="rounded-full justify-start bg-[#33CCFF] hover:bg-[#29A3CC] text-black"><a href={`https://waze.com/ul?q=${encodeURIComponent(ADDRESS_TEXT)}`} target="_blank" rel="noopener noreferrer"><Image src="/waze-logo.png" alt="Waze" width={96} height={96} className="mr-2 h-10 w-10 object-contain" /> Waze</a></Button>
            <Button asChild className="rounded-full justify-start bg-black hover:bg-neutral-800 text-white"><a href={`https://maps.apple.com/?q=${encodeURIComponent(ADDRESS_TEXT)}`} target="_blank" rel="noopener noreferrer"><Image src="/apple-maps.png" alt="Apple Maps" width={38} height={38} className="mr-2 h-8 w-8 object-contain" /> Apple Maps</a></Button>
            <Button onClick={() => copyToClipboard(ADDRESS_TEXT)} variant="outline" className="rounded-full justify-start"><Copy className="mr-2 h-4 w-4" /> Copy Address</Button>
          </div>
        </section>

        <div className="w-full h-px bg-shpc-edge"></div>

        {/* Call Us Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold font-playfair mb-2">We’re Just a Call Away 📞</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Need a hand? Message us on WhatsApp or call, and we’ll guide you step by step.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full bg-green-500 hover:bg-green-600 text-white">
              <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^\d]/g, "")}`} target="_blank" rel="noopener noreferrer">
                <Image src="/whatsapp-logo.png" alt="WhatsApp" width={32} height={32} className="mr-2 h-8 w-8 object-contain" /> WhatsApp
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-shpc-ink text-shpc-ink hover:bg-shpc-ink hover:text-white">
              <a href={`tel:${WHATSAPP_NUMBER}`}><Phone className="mr-2 h-5 w-5" /> Call Us</a>
            </Button>
          </div>
        </section>

        {/* Map Section */}
        <section>
          <p className="text-center max-w-2xl mx-auto mb-6 text-muted-foreground italic">Sweet Home Punta Cana, perfectly placed in Bávaro — next to everything, yet just far enough to feel like your own world.</p>
          <div className="rounded-2xl overflow-hidden shadow-soft">
            <EmbeddedMap
              mapUrl="https://www.google.com/maps/search/?api=1&query=Sweet+Home+Punta+Cana"
              zoom={14}
              apiKey={googleMapsApiKey}
            />
          </div>
        </section>

        {/* Arrival Tabs Section */}
        <section>
          <h2 className="text-center font-playfair text-4xl md:text-5xl mb-8">Choose Your Journey</h2>
          <div className="flex justify-center flex-wrap gap-2 border-b border-shpc-edge mb-6">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setMode(tab.id)} className={cn("flex items-center gap-2 px-6 py-3 font-semibold transition-colors rounded-t-lg", mode === tab.id ? 'bg-white text-shpc-ink border border-b-0 border-shpc-edge shadow-sm' : 'text-muted-foreground hover:bg-white/50 hover:text-shpc-ink')}>
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-soft">
            {mode === "taxi" && <TaxiDirections />}
            {mode === "public" && <PublicDirections />}
            {mode === "rental" && <RentalCarDirections />}
          </div>
        </section>

        {/* Transfer Promo Banner */}
        <section className="relative rounded-2xl shadow-soft overflow-hidden bg-shpc-ink text-white">
          <Image
            src="/transfer-seamless-arrival.png"
            alt="Airport transfer seamless arrival"
            fill
            className="object-cover opacity-40"
            data-ai-hint="airport transfer"
          />
          <div className="relative p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold font-playfair">Prefer a seamless arrival?</h2>
              <p className="mt-2 text-lg text-white/80">
                Let us take care of everything with a private transfer.
              </p>
            </div>
            <Button asChild size="lg" className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 shrink-0 mt-4 md:mt-0 rounded-full">
              <Link href="/airport-transfer">Book Transfer <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>

        {/* Follow Us Section */}
        <section className="text-center">
          <h2 className="font-playfair text-4xl mb-2">Follow Us ✨</h2>
          <p className="text-muted-foreground mb-6">See the latest from paradise.</p>
          <div className="flex justify-center items-center gap-6">
            <a href="https://www.facebook.com/sweethomepc" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-shpc-ink relative w-[48px] h-[48px]">
              <Image src="/facebook-logo-facebook-icon-transparent-free-png.png" alt="Facebook" fill className="object-contain" sizes="48px" />
            </a>
            <a href="https://www.instagram.com/sweethome_puntacana" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-shpc-ink relative w-[40px] h-[40px]">
              <Image src="/instagram.jpeg" alt="Instagram" fill className="object-contain p-1" sizes="40px" />
            </a>
            <a href="https://www.youtube.com/@IAMPUNTACANA" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-shpc-ink relative w-[58px] h-[58px]">
              <Image src="/youtube-logo-youtube-icon-transparent-free-png.png" alt="YouTube" fill className="object-contain" sizes="58px" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}


const Step = ({ number, title, children }: { number: string, title?: string, children: React.ReactNode }) => (
  <div className="flex items-start gap-6">
    <span className="font-playfair text-5xl text-shpc-yellow/50 leading-none shrink-0">{number}</span>
    <div>
      {title && <h4 className="font-bold text-lg mb-1">{title}</h4>}
      <div className="text-neutral-700 space-y-2 leading-relaxed">{children}</div>
    </div>
  </div>
);

function TaxiDirections() {
  return (
    <div className="space-y-8">
      <div className="bg-neutral-50 p-4 rounded-lg text-sm text-neutral-600 mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <span><strong>Estimated Duration:</strong> 25 minutes drive</span>
        <span><strong>Estimated Cost:</strong> USD$35 - USD$45 per private transfer</span>
      </div>

      <Step number="01">
        <p>After picking up your luggage go to the Exit Area where you will find two types of drivers:</p>
        <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
          <li><strong>Drivers with Pink Shirts:</strong> official Airport Taxi Drivers from the Punta Cana Transport Union</li>
          <li><strong>Drivers with White Shirts:</strong> Drivers from different Transportation Agencies</li>
          <li><strong>Driver with a sign with your name:</strong> if you had already booked your transfer</li>
        </ul>
      </Step>

      <Step number="02">
        <p>Tell your driver to bring you to <strong>Sweet Home Punta Cana Guest House - Villa Q15A</strong>.</p>
      </Step>

      <Step number="03">
        <p>Either provide our exact address to your driver or ask them to find us in Google Maps.</p>
      </Step>

      <Step number="04">
        <p>Once at our main gate, inform security staff you are staying at <strong>Sweet Home Punta Cana</strong> - they may ask for an ID, which will be returned to you after check-in.</p>
      </Step>

      <Step number="05">
        <p><strong>UBER drivers</strong> are not allowed to pick up passengers at the airport - they can only pick passengers up outside the airport.</p>
      </Step>

      <Step number="06">
        <p>If you are interested in booking your arrival transfer with us, <Link href="/airport-transfer" className="text-shpc-yellow font-bold hover:underline">click here!</Link></p>
      </Step>
    </div>
  );
}

function PublicDirections() {
  return (
    <div className="space-y-8">
      <div className="bg-neutral-50 p-4 rounded-lg text-sm text-neutral-600 mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <span><strong>Estimated Duration:</strong> 1.5h ride</span>
        <span><strong>Estimated Cost:</strong> USD$5 per person</span>
      </div>

      <Step number="01">
        <p>Once past the Airport Exit Area, either walk or take a taxi to the bus station outside the Punta Cana Airport.</p>
      </Step>

      <Step number="02">
        <p>Once at the Public Bus Station, board a ''guagua'' or bus in direction to <strong>Verón</strong>.</p>
      </Step>

      <Step number="03">
        <p>Once you get off the bus at Verón, take another ride in direction to <strong>Barceló</strong> and ask to be dropped off at <strong>Villas Bávaro</strong> (between Super Lama and Cocotal).</p>
      </Step>

      <Step number="04">
        <p>Once at our main gate, inform security staff you are staying at <strong>Sweet Home Punta Cana</strong> - they may ask for an ID, which will be returned to you after check-in.</p>
      </Step>

      <Step number="05">
        <p>Once past the main gate, walk and make a left at Dominican Republic Street and then a right at Paseo Cuba; Sweet Home will be the third property on your right side.</p>
      </Step>
    </div>
  );
}

function RentalCarDirections() {
  return (
    <div className="space-y-8">
      <div className="bg-neutral-50 p-4 rounded-lg text-sm text-neutral-600 mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <span><strong>Estimated Duration:</strong> 25 minutes drive</span>
        <span><strong>Estimated Cost:</strong> +USD$45 a day</span>
      </div>

      <Step number="01">
        <p>Once you have picked up your luggage, go to the Rental Car Office past the Airport Exit Area.</p>
      </Step>

      <Step number="02">
        <p>Finish registration process and wait for your vehicle to depart to your destination.</p>
      </Step>

      <Step number="03">
        <p>If you are interested in booking your Rental Car through us, <a href="https://wa.me/18095105465" target="_blank" rel="nooopener noreferrer" className="text-shpc-yellow font-bold hover:underline">click here!</a></p>
      </Step>
    </div>
  );
}

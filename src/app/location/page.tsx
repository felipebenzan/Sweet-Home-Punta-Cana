
'use client';

import { useState } from "react";
import { MapPin, Car, Bus, Plane, ExternalLink, Copy, Phone, MessageCircle, Info, ArrowRight } from "lucide-react";
import Link from 'next/link';
import EmbeddedMap from "@/components/embedded-map";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { Metadata } from 'next';
import { cn } from "@/lib/utils";


// 🔧 QUICK SETUP NOTES
const ADDRESS_TEXT = "Sweet Home Punta Cana, Bavaro, Punta Cana 23000, Dominican Republic";
const WHATSAPP_NUMBER = "+1-809-510-5465";

const tabs = [
 { id: "car", label: "By Car or Taxi", icon: Car },
 { id: "public", label: "Public Transport", icon: Bus },
 { id: "uber", label: "Uber from PUJ", icon: Plane },
];




export default function FindUsPage() {
  const [mode, setMode] = useState("car");
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
          src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/find%20us%2C%20contact%20us%20location%20sweet%20home%20punta%20cana.png?alt=media&token=b2288844-f5b6-44f4-a40d-3179aa7a3f70"
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
              <Button asChild className="rounded-full justify-start bg-[#4285F4] hover:bg-[#3572E1] text-white"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS_TEXT)}`} target="_blank" rel="noopener noreferrer"><Image src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/google%20maps%20sweet%20home%20punta%20cana.png?alt=media&token=17f1093d-121d-41a7-8f2f-1bf513689a38" alt="Google Maps" width={96} height={96} className="mr-2 h-10 w-10 object-contain" /> Google Maps</a></Button>
              <Button asChild className="rounded-full justify-start bg-[#33CCFF] hover:bg-[#29A3CC] text-black"><a href={`https://waze.com/ul?q=${encodeURIComponent(ADDRESS_TEXT)}`} target="_blank" rel="noopener noreferrer"><Image src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/WAZE%20SWEET%20HOME%20PUNTA%20CANA.png?alt=media&token=cdf100c3-f81c-412b-9401-0b5fbcbc148f" alt="Waze" width={96} height={96} className="mr-2 h-10 w-10 object-contain" /> Waze</a></Button>
              <Button asChild className="rounded-full justify-start bg-black hover:bg-neutral-800 text-white"><a href={`https://maps.apple.com/?q=${encodeURIComponent(ADDRESS_TEXT)}`} target="_blank" rel="noopener noreferrer"><Image src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/apple%20maps%20sweet%20home%20punta%20cana.png?alt=media&token=b4b5b372-d84d-45d8-8d32-4e68a7e54b9d" alt="Apple Maps" width={38} height={38} className="mr-2 h-8 w-8 object-contain"/> Apple Maps</a></Button>
              <Button onClick={() => copyToClipboard(ADDRESS_TEXT)} variant="outline" className="rounded-full justify-start"><Copy className="mr-2 h-4 w-4"/> Copy Address</Button>
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
                    <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
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
                    mapUrl="https://www.google.com/maps/search/?api=1&query=Supermercado+LAMA,+Bávaro"
                    origin="Sweet Home Punta Cana"
                    mode="walking"
                    zoom={15} 
                  />
              </div>
          </section>

          {/* Arrival Tabs Section */}
          <section>
             <h2 className="text-center font-playfair text-4xl md:text-5xl mb-8">Choose Your Journey</h2>
             <div className="flex justify-center border-b border-shpc-edge mb-6">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setMode(tab.id)} className={cn("flex items-center gap-2 px-6 py-3 font-semibold transition-colors", mode === tab.id ? 'text-shpc-ink border-b-2 border-shpc-ink' : 'text-muted-foreground hover:text-shpc-ink')}>
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
             </div>
             <div className="bg-white p-8 rounded-2xl shadow-soft">
                {mode === "car" && <CarDirections />}
                {mode === "public" && <PublicDirections />}
                {mode === "uber" && <UberDirections />}
             </div>
          </section>

          {/* Transfer Promo Banner */}
           <section className="relative rounded-2xl shadow-soft overflow-hidden bg-shpc-ink text-white">
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/Sweet%20Home%20Punta%20Cana%20private%20airport%20transfer.png?alt=media&token=6ca4f80f-9990-4ab8-9ff3-9f3b780de331"
                alt="Airport transfer van"
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
                 <a href="https://www.facebook.com/sweethomepc" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-shpc-ink">
                    <Image src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/facebook%20sweet%20home%20punta%20cana%20guest%20house.png?alt=media&token=9576b0e2-0d2d-4c8f-89a5-d97e0bbd56a7" alt="Facebook" width={24} height={24} className="h-6 w-6 object-contain" />
                 </a>
                 <a href="https://www.instagram.com/sweethome_puntacana" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-shpc-ink">
                    <Image src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/instagram%20sweet%20home%20punta%20cana.png?alt=media&token=27380234-317d-49d1-ac8b-527d171308d1" alt="Instagram" width={24} height={24} className="h-6 w-6 object-contain" />
                 </a>
                 <a href="https://www.youtube.com/@IAMPUNTACANA" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-shpc-ink">
                    <Image src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/youtube%20sweet%20home%20punta%20cana%20i%20am%20punta%20cana%20scooters%20punta%20cana.jpg?alt=media&token=f1eb40ef-feda-4780-b892-2e554237ae98" alt="YouTube" width={24} height={24} className="h-6 w-6 object-contain" />
                 </a>
              </div>
           </section>
       </div>
     </div>
   );
}


const Step = ({ number, title, children }: { number: string, title: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-6">
        <span className="font-playfair text-5xl text-shpc-yellow/50 leading-none">{number}</span>
        <div>
            <h4 className="font-bold text-lg">{title}</h4>
            <div className="text-muted-foreground space-y-2 mt-1">{children}</div>
        </div>
    </div>
);

function CarDirections() {
  return (
    <div className="space-y-6">
      <Step number="01" title="At the Airport">
        <p>After picking up your luggage, you’ll see two types of drivers:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Pink shirts</strong> → Official airport taxis.</li>
          <li><strong>White shirts</strong> → Private transfer services.</li>
        </ul>
      </Step>
      <Step number="02" title="Tell Your Driver">
        <p>You are going to <strong>Sweet Home Punta Cana at Villas Bávaro (Villa Q15A)</strong>.</p>
      </Step>
      <Step number="03" title="Navigation">
        <p>The location appears easily in Waze or Google Maps.</p>
      </Step>
      <Step number="04" title="At the Gate">
        <p>Inform the security guard you are a guest at <strong>Sweet Home Punta Cana, Villa Q15A</strong>. They may ask for an ID, which will be returned to you after check-in.</p>
      </Step>
    </div>
  );
}

function PublicDirections() {
  return (
     <div className="space-y-6">
      <Step number="01" title="Catch a Taxi">From PUJ, take a short taxi ride to the nearest bus stop on <strong>Boulevard Turístico del Este</strong>.</Step>
      <Step number="02" title="Board the 'Guagua'">Board a local bus (guagua) heading toward <strong>Bávaro / Los Corales</strong>. Ask to be dropped at <strong>Texaco Bávaro</strong>.</Step>
      <Step number="03" title="Final Stretch">From Texaco, it’s a short moto-taxi or walk to us. Message us on WhatsApp if you need guidance.</Step>
      <p className="pl-16 text-sm text-muted-foreground italic">Travel Tip: Keep small cash handy for fares and allow for flexible timing.</p>
    </div>
  );
}

function UberDirections() {
  return (
     <div className="space-y-6">
      <Step number="01" title="Request Your Ride">Once you exit arrivals, request an Uber to <strong>Sweet Home Punta Cana</strong>.</Step>
      <Step number="02" title="Update if Needed">If the driver cannot enter, update the destination to <strong>Texaco Bávaro</strong> or <strong>LAMA Supermarket</strong>.</Step>
      <Step number="03" title="Stay Connected">Share your trip status with us on WhatsApp for real-time assistance.</Step>
      <p className="pl-16 text-sm text-muted-foreground italic">Travel Tip: Connect to airport Wi-Fi before exiting to ensure a smooth Uber request.</p>
    </div>
  );
}

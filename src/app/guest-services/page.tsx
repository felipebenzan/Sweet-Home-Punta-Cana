
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Metadata } from 'next';
import { Plane, Car, Shirt, Utensils, Wifi, ConciergeBell, ShoppingBasket, Phone, Bike, Waves, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const services = [
    {
        icon: <Plane className="h-8 w-8 text-white" />,
        title: 'Airport Transfers',
        description: 'Arrive in style, without stress. Book your private ride directly from PUJ in just a few clicks.',
        image: 'https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/Private%20airport%20transfer%20taxi%20sweet%20home%20punta%20cana.png?alt=media&token=ccaa2b22-3432-4c66-be4f-af7f6e7aec6f',
        imageHint: 'airport arrivals',
        href: '/airport-transfer',
        cta: 'Book Transfer'
    },
    {
        icon: <Bike className="h-8 w-8 text-white" />,
        title: 'Bicycle & Scooter Rentals',
        description: 'Explore Punta Cana at your own pace—scooters, bicycles, and more, delivered to your door.',
        image: 'https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/Bycicle%20Vespa%20Scooter%20rental%20sweet%20home%20punta%20cana.png?alt=media&token=776f9bd2-45e7-47fa-934e-a261a68af3fb',
        imageHint: 'scooter rental',
        href: 'https://www.scooterspc.com',
        target: '_blank',
        cta: 'Reserve Your Ride'
    },
     {
        icon: <ConciergeBell className="h-8 w-8 text-white" />,
        title: 'Excursion Booking',
        description: 'From Saona Island to hidden cenotes—discover the best tours and adventures, booked seamlessly online.',
        image: 'https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/Excursion%20booking%20snorkeling%20sweet%20home%20punta%20cana%20guest%20services.png?alt=media&token=6015afee-578f-45cc-b8c4-ee2db9f7d311',
        imageHint: 'vacation excursion',
        href: '/excursions',
        cta: 'Book Excursion'
    },
    {
        icon: <Shirt className="h-8 w-8 text-white" />,
        title: 'Laundry Service',
        description: 'Travel light. Schedule laundry pickup during your stay and free up more time for paradise.',
        image: 'https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/laundry%20service%20guest%20services%20sweet%20home%20punta%20cana.png?alt=media&token=f82dc09e-4fe6-45f4-bb76-aaf099ec9de0',
        imageHint: 'laundry service',
        href: '/laundry-service',
        cta: 'Book Laundry Service'
    },
];

const secondaryServices = [
    {
        icon: <Waves className="h-6 w-6 text-white" />,
        title: 'Beach Access',
        description: 'Enjoy easy access to the beautiful beaches of Punta Cana.',
        image: 'https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/Bavaro%20beach%20access%20sweet%20home%20punta%20cana.png?alt=media&token=017d0f60-edfb-4c87-9f0d-74ff66c153ff',
        imageHint: 'beach access',
        href: '/beach-access',
        cta: 'Learn More'
    },
    {
        icon: <Utensils className="h-6 w-6 text-white" />,
        title: 'Food Delivery',
        description: 'Order from your favorite apps like Uber Eats or PedidosYa.',
        image: 'https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/food%20delivery%20uber%20eats%20pedidos%20ya%20sweet%20home%20punta%20cana.png?alt=media&token=8f8340a6-dc0e-4684-98eb-eeb7bf0b7d05',
        imageHint: 'food delivery',
        href: '/food-delivery',
        cta: 'See Options'
    },
    {
        icon: <ShoppingBasket className="h-6 w-6 text-white" />,
        title: 'Mini-Market Delivery',
        description: 'Get groceries delivered right to your door.',
        image: 'https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/Mini%20market%20delivery%20colmado%20sweet%20home%20punta%20cana.png?alt=media&token=447c4d2b-67f4-4389-b5e0-81bbc0b16af6',
        imageHint: 'grocery delivery',
        href: '/minimarket-delivery',
        cta: 'See Options'
    }
]

export default function GuestServicesPage() {
  return (
    <div className="bg-shpc-sand">
      {/* Hero Section */}
       <section className="relative h-[50vh] w-full flex items-center justify-center text-center text-white bg-black">
         <Image
          src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/Guest%20services%20sweet%20home%20punta%20cana%20guest%20house%20hotel%20hostel%20adults%20only.png?alt=media&token=d1ac1b86-bd1b-4343-980b-426082136f4b"
          alt="Guest enjoying a cocktail by the pool"
          fill
          priority
          className="object-cover opacity-40"
          data-ai-hint="resort pool"
        />
        <div className="relative z-10 p-6">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold">
            Guest Services ✨
          </h1>
          <p className="mt-4 text-lg md:text-2xl font-light max-w-2xl mx-auto">
             Book unforgettable experiences and essentials — all in just a few clicks.
          </p>
        </div>
       </section>

      <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map(service => {
                const isExternal = service.target === '_blank';
                const serviceCard = (
                    <Card className="shadow-soft rounded-2xl flex flex-col relative aspect-[4/3] overflow-hidden group h-full">
                        <Image 
                            src={service.image} 
                            alt={service.title} 
                            fill 
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={service.imageHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="relative flex flex-col items-start justify-end text-white h-full p-6 text-left">
                            <div className="mb-2 bg-black/30 backdrop-blur-sm p-2 rounded-full">
                                {service.icon}
                            </div>
                            <h3 className="font-playfair text-2xl font-bold">{service.title}</h3>
                            <p className="text-sm text-white/90 max-w-sm">{service.description}</p>
                             {service.cta && (
                                <Button asChild variant="secondary" className="mt-4 rounded-full bg-white/20 backdrop-blur-sm text-white border-white/20 hover:bg-white/30">
                                    <span className="flex items-center">
                                        {service.cta} <ArrowRight className="ml-2 h-4 w-4" />
                                    </span>
                                </Button>
                            )}
                        </div>
                    </Card>
                );

                return (
                  <Link href={service.href || '#'} key={service.title} target={service.target} rel={isExternal ? 'noopener noreferrer' : undefined} className="block h-full">
                    {serviceCard}
                  </Link>
                );
            })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {secondaryServices.map(service => {
                const isExternal = service.href?.startsWith('http');
                const serviceCard = (
                 <Card key={service.title} className="shadow-soft rounded-2xl flex flex-col relative aspect-[4/3] overflow-hidden group h-full">
                    <Image 
                        src={service.image} 
                        alt={service.title} 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={service.imageHint}
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                     <div className="relative flex flex-col items-center justify-center text-white h-full p-6 text-center">
                         <div className="mb-2 bg-black/30 backdrop-blur-sm p-2 rounded-full">
                            {service.icon}
                        </div>
                        <h3 className="font-playfair text-xl font-bold">{service.title}</h3>
                        <p className="text-sm text-white/90">{service.description}</p>
                         {service.cta && (
                            <Button asChild variant="secondary" size="sm" className="mt-3 rounded-full bg-white/20 backdrop-blur-sm text-white border-white/20 hover:bg-white/30">
                                <span className="flex items-center">
                                    {service.cta} <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            </Button>
                        )}
                     </div>
                </Card>);
                
                 if (service.href) {
                     return (
                      <Link href={service.href} key={service.title} target={isExternal ? '_blank' : '_self'} rel={isExternal ? 'noopener noreferrer' : undefined} className="block h-full">
                        {serviceCard}
                      </Link>
                    );
                 }

                 return serviceCard;
            })}
        </div>
      </div>
    </div>
  );
}


'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import { Button } from './ui/button';
import { ArrowRight, Plane, Bike, ConciergeBell, Shirt, Waves, Utensils, ShoppingBasket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';

const services = [
    {
        icon: <Plane className="h-6 w-6 text-shpc-ink" />,
        title: 'Airport Transfers',
        description: 'Seamless rides from PUJ.',
        image: '/Airport%20transfer%201.png',
        imageHint: 'airport arrivals',
        href: '/airport-transfer',
    },
    {
        icon: <Bike className="h-6 w-6 text-shpc-ink" />,
        title: 'Scooter Rentals',
        description: 'Explore at your own pace.',
        image: '/scooters%20punta%20cana%20guest%20services.png',
        imageHint: 'scooter rental',
        href: 'https://www.scooterspc.com',
    },
    {
        icon: <ConciergeBell className="h-6 w-6 text-shpc-ink" />,
        title: 'Excursions',
        description: 'Discover the best tours.',
        image: '/excursion%20bookin%20guest%20services.png',
        imageHint: 'vacation excursion',
        href: '/excursions',
    },
    {
        icon: <Shirt className="h-6 w-6 text-shpc-ink" />,
        title: 'Laundry Service',
        description: 'Fresh clothes, zero hassle.',
        image: '/Laundry%20Services.png',
        imageHint: 'laundry service',
        href: '/laundry-service',
    },
    {
        icon: <Waves className="h-6 w-6 text-shpc-ink" />,
        title: 'Beach Access',
        description: 'Easy access to beautiful beaches.',
        image: '/access%20to%20bavaro%20beach.png',
        imageHint: 'beach access',
        href: '/beach-access',
    },
    {
        icon: <Utensils className="h-6 w-6 text-shpc-ink" />,
        title: 'Food Delivery',
        description: 'Order from your favorite apps.',
        image: '/food%20delivery.png',
        imageHint: 'food delivery',
        href: '/food-delivery',
    },
    {
        icon: <ShoppingBasket className="h-6 w-6 text-shpc-ink" />,
        title: 'Mini-Market Delivery',
        description: 'Get groceries delivered.',
        image: '/Mini%20market%20delivery.png',
        imageHint: 'grocery delivery',
        href: '/minimarket-delivery',
    },
];


export default function GuestServicesCarousel() {
    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)

    React.useEffect(() => {
        if (!api) return;
        setCurrent(api.selectedScrollSnap());
        api.on("select", () => setCurrent(api.selectedScrollSnap()));
    }, [api]);

    return (
        <section className="py-16 lg:py-24 bg-shpc-sand">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-shpc-ink">
                        Enhance Your Stay
                    </h2>
                    <p className="mt-4 text-lg text-neutral-600">
                        Add services and experiences to make your trip unforgettable.
                    </p>
                </div>
                <Carousel
                    setApi={setApi}
                    opts={{ align: 'start', loop: true }}
                    plugins={[
                        Autoplay({
                            delay: 4000,
                            stopOnInteraction: true,
                            stopOnMouseEnter: true,
                        }),
                    ]}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {services.map((service, index) => (
                            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <Link href={service.href} target={service.href.startsWith('http') ? '_blank' : '_self'} className="block h-full">
                                    <Card className="h-full overflow-hidden shadow-soft rounded-2xl w-full flex flex-col group">
                                        <div className="relative aspect-video w-full overflow-hidden">
                                            <Image
                                                src={service.image}
                                                alt={service.title}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                data-ai-hint={service.imageHint}
                                            />
                                        </div>
                                        <div className="p-6 flex-grow flex flex-col">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-shpc-yellow/20 rounded-full">
                                                    {service.icon}
                                                </div>
                                                <h3 className="font-bold text-lg text-shpc-ink">{service.title}</h3>
                                            </div>
                                            <p className="text-muted-foreground mt-2 text-sm flex-grow">{service.description}</p>
                                            <div className="mt-4">
                                                <Button variant="link" className="p-0 h-auto text-shpc-ink">
                                                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
                <div className="mt-8 flex justify-center gap-2">
                    {services.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => api?.scrollTo(index)}
                            className={cn(
                                "h-2 w-8 rounded-full transition-colors",
                                current === index ? "bg-shpc-ink" : "bg-shpc-ink/20"
                            )}
                            aria-label={`Go to service ${index + 1}`}
                        />
                    ))}
                </div>
                <div className="text-center mt-12">
                    <Button asChild size="lg">
                        <Link href="/guest-services">See All Guest Services <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

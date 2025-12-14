"use client";

import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    Calendar as CalendarIcon, Users, ArrowRight, ArrowLeft, Check, MapPin, Clock, User, Ban, Phone, Wifi, AirVent, Tv, Bath, Wind, Refrigerator, Shirt, Sparkles, Home, Droplets, Ruler, FileText, Bike, Sailboat, Utensils, Waves
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import * as React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import RoomCard from "@/components/room-card";
import Link from "next/link";
import BookingBar from "@/components/booking-bar";
import { cn } from "@/lib/utils";
import GuestServicesCarousel from "@/components/guest-services-carousel";
import type { Room } from "@/lib/types";
const amenityIcons: { [key: string]: React.ReactNode } = {
    "air conditioning": <AirVent className="h-5 w-5 text-shpc-yellow" />,
    "free wi-fi": <Wifi className="h-5 w-5 text-shpc-yellow" />,
    "smart tv with netflix": <Tv className="h-5 w-5 text-shpc-yellow" />,
    "private bathroom": <Bath className="h-5 w-5 text-shpc-yellow" />,
    "private balcony": <Wind className="h-5 w-5 text-shpc-yellow" />,
    "patio access": <Home className="h-5 w-5 text-shpc-yellow" />,
    "mini fridge": <Refrigerator className="h-5 w-5 text-shpc-yellow" />,
    wardrobe: <Shirt className="h-5 w-5 text-shpc-yellow" />,
    "daily cleaning": <Sparkles className="h-5 w-5 text-shpc-yellow" />,
    "hot water": <Droplets className="h-5 w-5 text-shpc-yellow" />,
    "towels & toiletries": <Ruler className="h-5 w-5 text-shpc-yellow" />,
};

interface RoomClientPageProps {
    roomData: Room;
    otherRooms: Room[];
}

export default function RoomClientPage({ roomData, otherRooms }: RoomClientPageProps) {
    const room = roomData;

    const taglineParts = [
        `Sleeps ${room.capacity}`,
        "Private Bathroom",
        room.amenities.find((a) => a.toLowerCase().includes("balcony"))
            ? "Balcony View"
            : null,
    ].filter(Boolean);

    return (
        <div className="bg-shpc-sand">
            {/* Hero Section */}
            <section className="relative h-[60vh] bg-black">
                <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    className="object-cover opacity-50"
                    priority
                    data-ai-hint="hotel room"
                />
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-6">
                    <h1 className="text-4xl md:text-6xl font-bold font-playfair">{room.name}</h1>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl">
                        {taglineParts.join(" · ")}
                    </p>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 max-w-7xl mx-auto p-4 lg:p-8 gap-8 lg:gap-12">

                {/* Left Column (Content) */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Room Description */}
                    <section>
                        <h2 className="text-4xl font-playfair font-bold text-shpc-ink mb-4">Your Private Retreat</h2>
                        <div className="text-neutral-600 leading-relaxed whitespace-pre-line prose">
                            {room.description ? (
                                <p>{room.description}</p>
                            ) : (
                                <>
                                    <p>
                                        Welcome to the {room.name}, a sanctuary of comfort and style designed for the modern traveler. This room is perfect for{" "}
                                        {room.capacity === 1 ? "solo adventurers" : "couples or friends"}{" "}
                                        seeking a serene base to explore the vibrant life of Punta Cana. The space is thoughtfully appointed with a plush{" "}
                                        {room.bedding} bed, ensuring a restful night's sleep after a day of sun and sand.
                                    </p>
                                    <p className="mt-4">
                                        Every detail has been considered for your convenience, from the sleek, private bathroom with hot water to the high-speed Wi-Fi and Netflix-equipped Smart TV for your entertainment.
                                        Step out onto your private balcony or patio to enjoy the tropical breeze. Whether you're here for a short getaway or a longer stay, the {room.name} offers a perfect blend of home-like comfort and hotel-quality amenities.
                                    </p>
                                </>
                            )}
                        </div>
                    </section>

                    <Separator />

                    {/* Photo Gallery */}
                    <section>
                        <h2 className="text-4xl font-playfair font-bold text-shpc-ink mb-6">Gallery</h2>
                        <Carousel opts={{ loop: true }} className="rounded-2xl overflow-hidden shadow-soft">
                            <CarouselContent>
                                {(room.gallery && room.gallery.length > 0 ? room.gallery : [room.image]).map((img, index) => (
                                    <CarouselItem key={index}>
                                        <div className="relative aspect-video w-full">
                                            <Image
                                                src={img}
                                                alt={`${room.name} gallery image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                data-ai-hint="hotel room interior"
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-4" />
                            <CarouselNext className="right-4" />
                        </Carousel>
                    </section>

                    <Separator />

                    {/* Amenities */}
                    <section>
                        <h2 className="text-4xl font-playfair font-bold text-shpc-ink mb-6">Amenities</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                            {room.amenities.map((amenity) => {
                                const iconKey = amenity.toLowerCase();
                                return (
                                    <div key={amenity} className="flex items-center gap-3">
                                        {amenityIcons[iconKey] || <Check className="h-5 w-5 text-shpc-yellow" />}
                                        <span className="text-neutral-700">{amenity}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 bg-shpc-yellow/20 text-shpc-ink p-4 rounded-lg flex items-center gap-3">
                            <Utensils className="h-5 w-5 text-shpc-yellow-darker" />
                            <p className="font-medium text-sm">Just like home — cook, snack, or sip coffee in the kitchen.</p>
                        </div>
                        <div className="mt-4 bg-blue-100 text-blue-800 p-4 rounded-lg flex items-center gap-3">
                            <Waves className="h-5 w-5 text-blue-500" />
                            <p className="font-medium text-sm">Bavaro beach access, 15 to 20 min walk.</p>
                        </div>
                    </section>
                </div>

                {/* Right Column (Booking Widget) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <Card className="shadow-lg rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">Book Your Stay</CardTitle>
                                <CardDescription>Select your dates to see the price.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <BookingBar
                                    variant="vertical"
                                    roomSlug={room.slug}
                                    disableSticky
                                    className="border-none shadow-none p-0"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <Separator />
                {/* Policies */}
                <section className="py-12">
                    <h2 className="text-4xl font-playfair font-bold text-shpc-ink mb-6 text-center">Policies & Important Notes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-shpc-sand/50 border-none text-center">
                            <CardHeader className="items-center gap-4 pb-2">
                                <Clock className="h-8 w-8 text-shpc-ink" />
                                <CardTitle className="text-lg">Check-in / Out</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-1">
                                <p><strong>Check-in:</strong> 3:00 PM</p>
                                <p><strong>Check-out:</strong> 11:00 AM</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-shpc-sand/50 border-none text-center">
                            <CardHeader className="items-center gap-4 pb-2">
                                <Ban className="h-8 w-8 text-shpc-ink" />
                                <CardTitle className="text-lg">Occupancy</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-1">
                                <p>Maximum {room.capacity} guests.</p>
                                <p>Adults only (18+)</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-shpc-sand/50 border-none text-center">
                            <CardHeader className="items-center gap-4 pb-2">
                                <CalendarIcon className="h-8 w-8 text-shpc-ink" />
                                <CardTitle className="text-lg">Refund Policy</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-1">
                                <p>Standard refund 72h before check-in.</p>
                                <p>Reservations over $100 require cancellation 7 days before arrival.</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-shpc-sand/50 border-none text-center">
                            <CardHeader className="items-center gap-4 pb-2">
                                <FileText className="h-8 w-8 text-shpc-ink" />
                                <CardTitle className="text-lg">House Rules</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-1">
                                <p>No smoking inside.</p>
                                <p>Quiet hours after 11 PM.</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <Separator />

                {/* Other Rooms Section */}
                <section className="py-12">
                    <h2 className="text-4xl font-playfair font-bold text-shpc-ink mb-6 text-center">Explore Other Rooms</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {otherRooms.map((otherRoom) => (
                            <RoomCard key={otherRoom.id} room={otherRoom} linkToPage={true} />
                        ))}
                    </div>
                </section>

                <Separator />

                {/* Enhance Your Stay Section */}
                <GuestServicesCarousel />
            </div>
        </div>
    );
}

"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    CheckCircle,
    Home,
    Bus,
    Phone,
    Mail,
    Loader2,
    Download,
    MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { getServiceBookingById } from "@/server-actions";
import { ServiceBooking } from "@/lib/types";
import { format, parseISO } from "date-fns";
import QRCode from "react-qr-code";

function TransferConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingId = searchParams.get("bid");

    const [booking, setBooking] = useState<ServiceBooking | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!bookingId) {
            setIsLoading(false);
            return;
        }

        async function fetchBooking() {
            try {
                const data = await getServiceBookingById(bookingId!);
                setBooking(data);
            } catch (error) {
                console.error("Failed to fetch booking:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchBooking();
    }, [bookingId]);

    const handleDownload = async () => {
        const content = document.getElementById("transfer-confirmation-content");
        if (!content) return;

        try {
            const dataUrl = await toPng(content, {
                cacheBust: true,
                backgroundColor: "#FAF8F5",
                pixelRatio: 2 // Higher quality
            });

            const pdf = new jsPDF("p", "px", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(dataUrl);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, imgHeight);
            pdf.save(`sweet-home-transfer-${bookingId || "booking"}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-shpc-sand">
                <Loader2 className="h-8 w-8 animate-spin text-shpc-yellow" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center p-4">
                <h2 className="text-2xl font-bold mb-2">Booking ID Missing</h2>
                <p className="text-neutral-600 mb-4">
                    We couldn't find the booking reference. Please check your email.
                </p>
                <Button onClick={() => router.push("/")} className="bg-shpc-yellow hover:bg-shpc-yellow/90 text-shpc-ink">
                    <Home className="mr-2 h-4 w-4" /> Back to Home
                </Button>
            </div>
        );
    }

    const details = booking.details ? JSON.parse(booking.details) : {};
    const isDeparture = details.direction === 'depart' || (details.direction === 'round' && details.departureDate);

    // Determine display values
    const from = details.direction === 'arrive' ? "Punta Cana Intl. Airport" : "Sweet Home Punta Cana";
    const fromCode = details.direction === 'arrive' ? "PUJ" : "SHPC";
    const to = details.direction === 'arrive' ? "Sweet Home Punta Cana" : "Punta Cana Intl. Airport";
    const toCode = details.direction === 'arrive' ? "SHPC" : "PUJ";

    const flightNumber = details.direction === 'arrive' ? details.arrivalFlight : details.departureFlight;
    const date = details.direction === 'arrive' ? details.arrivalDate : details.departureDate;
    const time = details.direction === 'depart' ? details.departureTime : null; // Only show time for departure

    return (
        <div className="bg-shpc-sand min-h-screen py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Downloadable Content Wrapper */}
                <div id="transfer-confirmation-content" className="space-y-12">
                    {/* Header - Confirmation Stamp */}
                    <div className="text-center space-y-4">
                        <div className="inline-block">
                            <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" strokeWidth={1.5} />
                        </div>
                        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-shpc-ink">
                            Your Transfer is Booked!
                        </h1>
                        <p className="font-inter text-lg text-neutral-600 max-w-2xl mx-auto">
                            Your journey is secured. We've sent a confirmation to your email.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm font-mono text-neutral-500">
                            <Bus className="h-4 w-4" />
                            <span>Booking ID: <span className="text-shpc-ink font-semibold">{booking.id.substring(0, 8)}...</span></span>
                        </div>
                        <p className="font-playfair text-lg italic text-shpc-yellow">
                            A great journey awaits you!
                        </p>
                    </div>

                    {/* Main Ticket Container */}
                    <div className="bg-[#FAF8F5] border-2 border-dashed border-shpc-edge rounded-lg shadow-lg overflow-hidden">
                        {/* Ticket Header */}
                        <div className="bg-shpc-ink text-white py-4 px-6 border-b-2 border-dashed border-white/20">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-xs uppercase tracking-wider text-white/70">Boarding Pass</p>
                                    <p className="font-playfair text-2xl font-bold">Sweet Home Transfer</p>
                                    <p className="text-xs font-mono text-shpc-yellow mt-1">Booking: {booking.id}</p>
                                </div>
                                <Bus className="h-8 w-8 text-shpc-yellow" />
                            </div>
                        </div>

                        {/* Ticket Body - 3 Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-dashed divide-shpc-edge">

                            {/* Column 1: Departure/Arrival */}
                            <div className="p-6 space-y-6">
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-3">
                                        Departure / Arrival
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">From</p>
                                        <p className="font-inter font-bold text-shpc-ink text-base">
                                            {from}
                                        </p>
                                        <p className="font-mono text-sm text-neutral-600">{fromCode}</p>
                                    </div>

                                    <div className="flex items-center justify-center py-2">
                                        <div className="h-px w-full bg-shpc-edge relative">
                                            <Bus className="h-4 w-4 text-shpc-yellow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FAF8F5]" />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">To</p>
                                        <p className="font-inter font-bold text-shpc-ink text-base">
                                            {to}
                                        </p>
                                        <p className="font-mono text-sm text-neutral-600">{toCode}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-dashed border-shpc-edge space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-xs text-neutral-500 uppercase">Flight</span>
                                        <span className="font-mono text-sm font-semibold text-shpc-ink">{flightNumber || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-neutral-500 uppercase">Date</span>
                                        <span className="font-mono text-sm font-semibold text-shpc-ink">
                                            {date ? format(parseISO(date), "MMM do yyyy") : "N/A"}
                                        </span>
                                    </div>
                                    {time && (
                                        <div className="flex justify-between">
                                            <span className="text-xs text-neutral-500 uppercase">Pickup Time</span>
                                            <span className="font-mono text-sm font-semibold text-shpc-ink">{time} EST</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Column 2: Passenger/Booking Info */}
                            <div className="p-6 space-y-6">
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-3">
                                        Passenger / Booking Info
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Passenger Name</p>
                                        <p className="font-playfair font-bold text-shpc-ink text-xl">
                                            {booking.guestName}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Booking Reference</p>
                                        <p className="font-mono text-sm font-semibold text-shpc-ink break-all">
                                            {booking.id}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Service Type</p>
                                        <p className="font-inter font-semibold text-shpc-ink">
                                            {details.direction === 'arrive' ? 'Arrival' : (details.direction === 'depart' ? 'Departure' : 'Round Trip')}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <div className="bg-shpc-yellow/10 border-l-2 border-shpc-yellow p-3 rounded-r">
                                        <p className="text-xs text-shpc-ink font-inter">
                                            <strong>Note:</strong> Your driver will be waiting with a sign bearing your name.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Column 3: Price/QR */}
                            <div className="p-6 space-y-6">
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-3">
                                        Price / Code
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* QR Code */}
                                    <div className="flex justify-center">
                                        <div className="w-32 h-32 bg-white border-2 border-shpc-edge rounded-lg flex items-center justify-center p-2">
                                            <QRCode value={`TRANSFER-${booking.id}`} size={100} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Total</p>
                                        <p className="font-playfair font-bold text-shpc-ink text-3xl">
                                            ${booking.total?.toFixed(2)} USD
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Footer */}
                        <div className="bg-shpc-sand border-t-2 border-dashed border-shpc-edge py-3 px-6">
                            <p className="text-xs text-center text-neutral-500 font-inter">
                                Please present this confirmation upon arrival · Sweet Home Punta Cana
                            </p>
                        </div>
                    </div>
                </div>

                {/* What's Next Section */}
                <div className="bg-white border border-shpc-edge rounded-lg p-8 space-y-6">
                    <h2 className="font-playfair text-2xl font-semibold text-shpc-ink">
                        What Happens Next?
                    </h2>

                    <ol className="space-y-4">
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-shpc-yellow text-shpc-ink flex items-center justify-center font-bold text-sm">
                                1
                            </span>
                            <p className="text-neutral-700 font-inter pt-1">
                                We'll verify your flight details to ensure a seamless pickup.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-shpc-yellow text-shpc-ink flex items-center justify-center font-bold text-sm">
                                2
                            </span>
                            <p className="text-neutral-700 font-inter pt-1">
                                Your driver will be waiting at the arrivals exit with a sign bearing your name.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-shpc-yellow text-shpc-ink flex items-center justify-center font-bold text-sm">
                                3
                            </span>
                            <p className="text-neutral-700 font-inter pt-1">
                                Relax and enjoy the ride to Sweet Home Punta Cana!
                            </p>
                        </li>
                    </ol>
                </div>

                {/* Need Help Section */}
                <div className="bg-white border border-shpc-edge rounded-lg p-8">
                    <h3 className="font-playfair text-2xl font-semibold text-shpc-ink mb-6">
                        Need Help?
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button
                            asChild
                            variant="outline"
                            className="w-full border-shpc-edge hover:border-shpc-yellow hover:bg-shpc-yellow/10"
                        >
                            <a
                                href="https://wa.me/18095105465"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Contact via WhatsApp
                            </a>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="w-full border-shpc-edge hover:border-shpc-yellow hover:bg-shpc-yellow/10"
                        >
                            <a href="mailto:info@sweethomepuntacana.com">
                                <Mail className="mr-2 h-4 w-4" />
                                Email Support
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
                    <Button
                        onClick={handleDownload}
                        className="w-full bg-shpc-yellow hover:bg-shpc-yellow/90 text-shpc-ink font-semibold py-6"
                    >
                        <Download className="mr-2 h-5 w-5" />
                        Download Confirmation
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="w-full border-shpc-edge hover:border-shpc-yellow py-6"
                    >
                        <Link href="/">
                            <Home className="mr-2 h-5 w-5" />
                            Back to Homepage
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function TransferConfirmationPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-shpc-sand">
                    <Loader2 className="h-8 w-8 animate-spin text-shpc-yellow" />
                </div>
            }
        >
            <TransferConfirmationContent />
        </Suspense>
    );
}

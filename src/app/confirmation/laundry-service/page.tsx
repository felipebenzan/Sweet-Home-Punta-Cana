"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    CheckCircle,
    Home,
    Shirt,
    Phone,
    Mail,
    Loader2,
    Download,
    MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

function LaundryConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    const [booking, setBooking] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (orderId) {
            fetch(`/api/bookings/${orderId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setBooking(data.booking);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch booking:", err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [orderId]);

    const handleDownload = async () => {
        const content = document.getElementById("laundry-confirmation-content");
        if (!content) return;

        try {
            const dataUrl = await toPng(content, {
                cacheBust: true,
                backgroundColor: "#FAF8F5",
                pixelRatio: 2
            });

            const pdf = new jsPDF("p", "px", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(dataUrl);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, imgHeight);
            pdf.save(`sweet-home-laundry-${orderId || "order"}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
        }
    };

    if (!orderId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center p-4">
                <h2 className="text-2xl font-bold mb-2">Order ID Missing</h2>
                <p className="text-neutral-600 mb-4">
                    We couldn't find the order reference. Please check your email.
                </p>
                <Button onClick={() => router.push("/")} className="bg-shpc-yellow hover:bg-shpc-yellow/90 text-shpc-ink">
                    <Home className="mr-2 h-4 w-4" /> Back to Home
                </Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-shpc-sand">
                <Loader2 className="h-8 w-8 animate-spin text-shpc-yellow" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center p-4">
                <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
                <p className="text-neutral-600 mb-4">
                    We couldn't find the booking details.
                </p>
                <Button onClick={() => router.push("/")} className="bg-shpc-yellow hover:bg-shpc-yellow/90 text-shpc-ink">
                    <Home className="mr-2 h-4 w-4" /> Back to Home
                </Button>
            </div>
        );
    }

    // Parse details if it's a string
    const details = typeof booking.details === 'string' ? JSON.parse(booking.details) : booking.details || {};

    return (
        <div className="bg-shpc-sand min-h-screen py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header - Confirmation Stamp */}
                <div className="text-center space-y-4" id="laundry-confirmation-content">
                    <div className="inline-block">
                        <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" strokeWidth={1.5} />
                    </div>
                    <h1 className="font-playfair text-4xl md:text-5xl font-bold text-shpc-ink">
                        Laundry Pickup Scheduled!
                    </h1>
                    <p className="font-inter text-lg text-neutral-600 max-w-2xl mx-auto">
                        We'll take care of the rest. A confirmation has been sent to your email.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm font-mono text-neutral-500">
                        <Shirt className="h-4 w-4" />
                        <span>Order ID: <span className="text-shpc-ink font-semibold">{orderId}</span></span>
                    </div>
                </div>

                {/* Service Receipt Container */}
                <div className="bg-[#FAF8F5] border-2 border-dashed border-neutral-300 rounded-lg shadow-lg overflow-hidden">
                    {/* Receipt Header */}
                    <div className="bg-shpc-ink text-white py-4 px-6 border-b-2 border-dashed border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-playfair text-2xl font-bold">Sweet Home Punta Cana</p>
                                <p className="text-xs uppercase tracking-wider text-white/70 mt-1">Service Receipt</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wide text-white/70">Date</p>
                                <p className="font-mono text-sm font-semibold">
                                    {booking.date ? new Date(booking.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', timeZone: 'UTC' }) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Body */}
                    <div className="p-8 space-y-6">
                        {/* Guest Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-dashed border-neutral-300">
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Guest Name</p>
                                <p className="font-inter font-semibold text-shpc-ink">{booking.guestName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Email</p>
                                <p className="font-inter font-semibold text-shpc-ink">{booking.email}</p>
                            </div>
                            {booking.phone && (
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Phone</p>
                                    <p className="font-inter font-semibold text-shpc-ink">{booking.phone}</p>
                                </div>
                            )}
                            {details.roomNumber && (
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Room Number</p>
                                    <p className="font-inter font-semibold text-shpc-ink">{details.roomNumber}</p>
                                </div>
                            )}
                        </div>

                        {/* Service Details */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-dashed border-neutral-300">
                                <span className="text-sm text-neutral-500 font-inter uppercase tracking-wide">Service</span>
                                <span className="font-playfair text-xl font-bold text-shpc-ink">Wash & Fold</span>
                            </div>

                            <div className="flex justify-between items-center pb-3 border-b border-dashed border-neutral-300">
                                <span className="text-sm text-neutral-500 font-inter uppercase tracking-wide">Bags</span>
                                <span className="font-inter text-lg font-bold text-shpc-ink">{details.bags || 1}</span>
                            </div>
                        </div>

                        {/* Schedule Details */}
                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-neutral-500 font-inter uppercase tracking-wide">Service Date</span>
                                <span className="font-inter font-bold text-shpc-ink">
                                    {booking.date ? new Date(booking.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : 'N/A'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-neutral-500 font-inter uppercase tracking-wide">Pickup Time</span>
                                <span className="font-inter font-bold text-shpc-ink">{details.pickupTime || '08:00 AM'}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-neutral-500 font-inter uppercase tracking-wide">Delivery Time</span>
                                <span className="font-inter font-bold text-shpc-ink">Before 5:00 PM (Same Day)</span>
                            </div>
                        </div>

                        {/* Special Instructions */}
                        {details.specialInstructions && (
                            <div className="pt-4 border-t border-dashed border-neutral-300">
                                <p className="text-sm text-neutral-500 font-inter uppercase tracking-wide mb-2">Special Instructions</p>
                                <p className="font-inter text-shpc-ink">{details.specialInstructions}</p>
                            </div>
                        )}

                        {/* Total */}
                        <div className="pt-6 border-t-2 border-neutral-400 flex justify-between items-center">
                            <span className="font-inter text-base uppercase tracking-wide text-neutral-700">Total Paid</span>
                            <span className="font-playfair text-3xl font-bold text-shpc-ink">${booking.total?.toFixed(2)} USD</span>
                        </div>
                    </div>

                    {/* Receipt Footer */}
                    <div className="bg-shpc-sand border-t-2 border-dashed border-neutral-300 py-3 px-6">
                        <p className="text-xs text-center text-neutral-500 font-inter">
                            Thank you for choosing Sweet Home Punta Cana Laundry Service
                        </p>
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
                                Please leave your laundry bag outside your door or at the reception.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-shpc-yellow text-shpc-ink flex items-center justify-center font-bold text-sm">
                                2
                            </span>
                            <p className="text-neutral-700 font-inter pt-1">
                                Our team will collect it shortly.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-shpc-yellow text-shpc-ink flex items-center justify-center font-bold text-sm">
                                3
                            </span>
                            <p className="text-neutral-700 font-inter pt-1">
                                Your fresh, clean, and folded clothes will be returned before 5:00 PM the same day.
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
                        Download Receipt
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

export default function LaundryConfirmationPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-shpc-sand">
                    <Loader2 className="h-8 w-8 animate-spin text-shpc-yellow" />
                </div>
            }
        >
            <LaundryConfirmationContent />
        </Suspense>
    );
}

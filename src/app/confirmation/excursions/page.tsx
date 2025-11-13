"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Excursion, ServiceBooking } from "@/lib/types";
import { format, parseISO } from "date-fns";
import {
  CheckCircle,
  Home,
  Calendar,
  Users as UsersIcon,
  Clock,
  MapPin,
  ArrowRight,
  Info,
  Sailboat,
  Download,
  Sun,
  Watch,
  Glasses,
  Tally1,
  Wind,
  Camera,
  DollarSign,
  Footprints,
  Droplets,
  QrCode,
  Ticket,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import EmbeddedMap from "@/components/embedded-map";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import {
  getServiceBookingById,
  getExcursionById,
} from "@/server-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bid = searchParams.get("bid");
  const [booking, setBooking] = React.useState<ServiceBooking | null>(null);
  const [excursion, setExcursion] = React.useState<Excursion | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!bid) {
      setIsLoading(false);
      return;
    }

    async function fetchBooking() {
      try {
        const bookingData = await getServiceBookingById(bid);
        setBooking(bookingData);
        if (bookingData?.excursionId) {
          const excursionData = await getExcursionById(bookingData.excursionId);
          setExcursion(excursionData);
        }
      } catch (error) {
        console.error("Failed to fetch booking details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBooking();
  }, [bid]);

  const handleDownload = async () => {
    const content = document.getElementById("booking-confirmation-content");
    if (!content) return;

    toPng(content, { cacheBust: true, backgroundColor: "#F9F7F2" }).then(
      (dataUrl) => {
        const pdf = new jsPDF("p", "px", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(dataUrl);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, imgHeight);
        pdf.save(`shpc-excursion-confirmation-${booking?.id}.pdf`);
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-shpc-sand">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!booking || !excursion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-shpc-sand text-center p-4">
        <h2 className="text-2xl font-bold mb-2">Booking not found</h2>
        <p className="text-muted-foreground mb-4">
          The confirmation details could not be loaded. Please check your email.
        </p>
        <Button onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
    );
  }

  const shortId = booking.id.substring(0, 8).toUpperCase();
  const pax = booking.pax || "1 Adult";

  return (
    <div className="bg-shpc-sand min-h-screen py-12 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div
          id="booking-confirmation-content"
          className="bg-shpc-sand py-8 px-4 rounded-2xl"
        >
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold">Adventure Locked In!</h1>
            <p className="text-muted-foreground mt-2">
              Pack your sunscreen, {booking.guestName}! A confirmation has been
              sent to {booking.email}.
            </p>
            <p className="text-sm text-muted-foreground mt-1 font-mono flex items-center justify-center gap-2">
              <Ticket className="h-4 w-4" />
              Booking ID: {shortId}
            </p>
          </div>
          <div className="space-y-6">
            <Card className="p-6 rounded-2xl shadow-soft">
              <h3 className="font-semibold text-lg mb-4 text-center">
                Your Booked Excursion
              </h3>
              <p className="font-semibold text-lg">{excursion.title}</p>
              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />{" "}
                  {booking.date
                    ? format(parseISO(booking.date), "EEEE, MMM dd")
                    : "Date to be confirmed"}
                </p>
                <p className="flex items-center gap-1.5">
                  <UsersIcon className="h-4 w-4" /> {pax}
                </p>
              </div>
            </Card>

            <Separator />

            <Card className="p-6 rounded-2xl shadow-soft">
              <h3 className="font-semibold text-lg mb-2">Payment Summary</h3>
              <div className="flex justify-between font-bold">
                <span className="text-base">Total Paid (USD)</span>
                <span className="font-mono text-base">
                  ${booking.total?.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-green-600 font-medium flex items-center gap-1.5 pt-2">
                <CheckCircle className="h-3.5 w-3.5" /> All taxes & fees
                included.
              </div>
            </Card>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 print:hidden">
          <Button onClick={handleDownload} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Homepage
            </Link>
          </Button>
        </div>

        {/* Upsell Section */}
        <section className="pt-16 print:hidden">
          <div className="max-w-6xl mx-auto">
            <div className="relative rounded-2xl shadow-soft overflow-hidden bg-shpc-ink text-white">
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/punta-cana-stays.firebasestorage.app/o/vespa%20scooters%20rental%20sweet%20home%20punta%20cana.png?alt=media&token=3f42e248-bf5a-4979-8b2e-4f8dc746c4bf"
                alt="Scooter against a tropical background"
                fill
                className="object-cover opacity-40"
                data-ai-hint="scooter rental"
              />
              <div className="relative p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="max-w-xl">
                  <h2 className="text-3xl md:text-4xl font-bold font-playfair">
                    Explore on Two Wheels
                  </h2>
                  <p className="mt-4 text-lg text-white/80">
                    “From Sweet Home to Every Corner of Paradise – Rent Your
                    Scooter Today”
                  </p>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 shrink-0"
                >
                  <a
                    href="https://www.scooterspc.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Reserve a Scooter <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ExcursionConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-shpc-sand">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}

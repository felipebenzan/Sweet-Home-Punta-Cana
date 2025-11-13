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
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns";
import {
  CheckCircle,
  User,
  Calendar as CalendarIcon,
  Home,
  BedDouble,
  Users as UsersIcon,
  Plane,
  ArrowRight,
  Sailboat,
  Bike,
  Map,
  Info,
  Clock,
  Ticket,
  Building,
  Badge,
  Download,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "react-qr-code";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as htmlToImage from "html-to-image";
import GuestServicesCarousel from "@/components/guest-services-carousel";
import { Suspense } from "react";
import { getReservationById } from "@/server-actions";
import type { Reservation } from "@/lib/types";

const PaymentSummary = ({ booking }: { booking: Reservation | null }) => {
  if (!booking) {
    return (
      <Card className="shadow-soft rounded-2xl">
        <CardHeader>
          <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft rounded-2xl">
      <CardHeader className="flex-row items-center justify-between p-6">
        <div>
          <CardTitle className="text-xl">Payment Summary</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Receipt sent to {booking.guestEmail}
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 border-green-200"
        >
          <CheckCircle className="h-4 w-4 mr-1.5" /> Paid
        </Badge>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        <div className="space-y-2 text-sm pt-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono">${booking.totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-base">Total Paid (USD)</span>
            <span className="font-mono text-base">
              ${booking.totalPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span>Balance Due at Check-in</span>
            <span className="font-mono">$0.00</span>
          </div>
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Paid on: {format(new Date(booking.createdAt), "MMM dd, yyyy")}</p>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <div className="p-4 bg-green-50 text-green-800 rounded-2xl text-sm space-y-2 w-full">
          <p className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-0.5 shrink-0" /> Check-in: 3:00 PM •
            Check-out: 11:00 AM
          </p>
          <p className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" /> Free cancellation up to
            48h before arrival.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bid = searchParams.get("bid");

  const [booking, setBooking] = React.useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!bid) {
      setIsLoading(false);
      return;
    }

    async function fetchBooking() {
      try {
        const data = await getReservationById(bid);
        setBooking(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBooking();
  }, [bid]);

  const handleDownloadImage = () => {
    const node = document.getElementById("confirmation-content");
    if (node) {
      htmlToImage
        .toPng(node, {
          backgroundColor: "#F9F7F2",
          pixelRatio: 2,
          cacheBust: true,
          imagePlaceholder:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        })
        .then(function (dataUrl) {
          const link = document.createElement("a");
          link.download = `shpc-confirmation-${booking?.id || "details"}.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch(function (error) {
          console.error("oops, something went wrong!", error);
        });
    }
  };

  const googleCalUrl = () => {
    if (!booking) return "";

    const title = encodeURIComponent(`Sweet Home Punta Cana — Check-in`);
    const details = encodeURIComponent(
      `Reservation: ${booking.id}\nRoom: ${booking.roomName}\nSupport: WhatsApp +1-809-510-5465`
    );
    const location = encodeURIComponent(
      "Sweet Home Punta Cana, Av. Alemania, Bávaro, Punta Cana"
    );
    const start = new Date(booking.checkInDate + "T15:00:00-04:00")
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
    const end = new Date(booking.checkOutDate + "T11:00:00-04:00")
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
  };

  const buildICS = () => {
    if (!booking) return "";

    const dtstamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
    const toICSUTC = (iso: string) =>
      new Date(iso)
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z");

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sweet Home Punta Cana//Booking//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${booking.id}@sweethomepc.com`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${toICSUTC(booking.checkInDate + "T15:00:00-04:00")}`,
      `DTEND:${toICSUTC(booking.checkOutDate + "T11:00:00-04:00")}`,
      "SUMMARY:Sweet Home Punta Cana — Check-in",
      `LOCATION:Sweet Home Punta Cana, Av. Alemania, Bávaro, Punta Cana`,
      `DESCRIPTION:Reservation ${booking.id}\nRoom: ${booking.roomName}\nSupport: WhatsApp +1-809-510-5465`,
      "END:VEVENT",
    ];

    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  };

  const downloadICS = () => {
    const filename = `${booking?.id}.ics`;
    const content = buildICS();
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-shpc-sand">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!booking) {
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
  // console.log("Booking Details:", booking.checkInDate, booking.checkOutDate);

  const fromDate = parseISO(booking.checkInDate);
  const toDate = parseISO(booking.checkOutDate);
  const shortId = booking.id.substring(0, 7).toUpperCase();

  return (
    <div className="bg-shpc-sand min-h-screen">
      <section className="relative bg-black text-white text-center py-20">
        <Image
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
          alt="Tropical resort view"
          fill
          className="object-cover opacity-30"
          data-ai-hint="resort pool"
        />
        <div className="relative z-10 p-6">
          <CheckCircle className="h-16 w-16 text-green-400 mb-4 mx-auto" />
          <h1 className="text-3xl font-bold">
            Pack your bags, {booking.guestName.split(" ")[0]}!
          </h1>
          <p className="mt-2 text-white/80 max-w-2xl mx-auto">
            You’re coming to Punta Cana! We’ve sent your confirmation to{" "}
            {booking.guestEmail}.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-24">
        <div
          id="confirmation-content"
          className="space-y-8 bg-shpc-sand pt-8 rounded-2xl"
        >
          <Card className="shadow-soft rounded-2xl">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <QRCode value={`${shortId}-${booking.roomName}`} size={72} />
              </div>
              <div className="flex-grow">
                <p className="text-sm text-muted-foreground">Reservation ID</p>
                <p className="font-bold text-xl text-foreground tracking-wider">
                  {shortId}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep this for check-in.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft rounded-2xl">
            <CardHeader>
              <CardTitle>Your Reservation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-semibold text-foreground">
                {booking.roomName}
              </p>
              <Separator />
              <div className="text-sm space-y-2">
                <p className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />{" "}
                  <strong>Dates:</strong> {format(fromDate, "MMM dd")} -{" "}
                  {format(toDate, "MMM dd, yyyy")}
                </p>
                <p className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />{" "}
                  <strong>Guests:</strong> {booking.numberOfGuests}{" "}
                  {booking.numberOfGuests === 1 ? "guest" : "guests"}
                </p>
              </div>
            </CardContent>
          </Card>

          <PaymentSummary booking={booking} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="w-full bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90"
            onClick={handleDownloadImage}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90">
                Add to Calendar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => window.open(googleCalUrl(), "_blank")}
              >
                Add to Google Calendar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadICS}>
                Download .ics File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="pt-8 print:hidden">
          <GuestServicesCarousel />
        </div>

        <div className="text-center p-6 bg-shpc-sand border-t rounded-b-2xl print:hidden">
          <p className="text-muted-foreground">
            💬 Need help or want to customize your stay?{" "}
            <a
              href="https://wa.me/18095105465"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-shpc-ink underline hover:text-primary"
            >
              Chat with us on WhatsApp.
            </a>
          </p>
        </div>
      </div>
      <div className="print-only hidden">
        <h3 className="text-lg font-bold text-center">Sweet Home Punta Cana</h3>
        <p className="text-xs text-center text-muted-foreground">
          www.sweethomepuntacana.com | www.sweethomepc.com <br />
          +1 (809) 510-5465 • contact@puntacanastays.com
        </p>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-shpc-sand">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}

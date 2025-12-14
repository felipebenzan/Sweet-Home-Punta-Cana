"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns";
import {
  CheckCircle,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  Plane,
  Clock,
  Download,
  Loader2,
  ArrowLeft,
  Home,
  CalendarPlus,
  MapPin
} from "lucide-react";
import Image from "next/image";
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
import { getReservationById, getServiceBookingById } from "@/server-actions";
import type { Reservation, ServiceBooking } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EmbeddedMap from "@/components/embedded-map";

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bid = searchParams.get("bid");

  const [booking, setBooking] = React.useState<Reservation | ServiceBooking | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!bid) {
      setIsLoading(false);
      return;
    }

    async function fetchBooking() {
      try {
        // Try fetching as reservation first
        const reservation = await getReservationById(bid!);
        if (reservation) {
          setBooking(reservation);
        } else {
          // If not found, try fetching as service booking
          const serviceBooking = await getServiceBookingById(bid!);
          if (serviceBooking) {
            setBooking(serviceBooking);
          }
        }
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

    const titleStr = isReservation(booking) ? `Sweet Home Punta Cana — Check-in` : `Sweet Home Punta Cana — ${title}`;
    const detailsStr = isReservation(booking)
      ? `Reservation: ${booking.id}\nRoom: ${booking.roomName}\nSupport: WhatsApp +1-809-510-5465`
      : `Booking: ${booking.id}\nService: ${title}\nSupport: WhatsApp +1-809-510-5465`;

    const encodedTitle = encodeURIComponent(titleStr);
    const encodedDetails = encodeURIComponent(detailsStr);
    const location = encodeURIComponent(
      "Sweet Home Punta Cana, Av. Alemania, Bávaro, Punta Cana"
    );

    // For excursions, start time might be in details, but for now use date at 9 AM
    const start = new Date(fromDate);
    if (isReservation(booking)) start.setHours(15, 0, 0);
    else start.setHours(9, 0, 0);

    const end = new Date(toDate);
    if (isReservation(booking)) end.setHours(11, 0, 0);
    else end.setHours(13, 0, 0); // 4 hours approx

    const startStr = start.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const endStr = end.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&details=${encodedDetails}&location=${location}&dates=${startStr}/${endStr}`;
  };

  const buildICS = () => {
    if (!booking) return "";

    const dtstamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
    const toICSUTC = (date: Date) =>
      date.toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z");

    const start = new Date(fromDate);
    if (isReservation(booking)) start.setHours(15, 0, 0);
    else start.setHours(9, 0, 0);

    const end = new Date(toDate);
    if (isReservation(booking)) end.setHours(11, 0, 0);
    else end.setHours(13, 0, 0);

    const summary = isReservation(booking) ? "Sweet Home Punta Cana — Check-in" : `Sweet Home Punta Cana — ${title}`;
    const description = isReservation(booking)
      ? `Reservation ${booking.id}\nRoom: ${booking.roomName}\nSupport: WhatsApp +1-809-510-5465`
      : `Booking ${booking.id}\nService: ${title}\nSupport: WhatsApp +1-809-510-5465`;

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sweet Home Punta Cana//Booking//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${booking.id}@sweethomepc.com`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${toICSUTC(start)}`,
      `DTEND:${toICSUTC(end)}`,
      `SUMMARY:${summary}`,
      `LOCATION:Sweet Home Punta Cana, Av. Alemania, Bávaro, Punta Cana`,
      `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ];

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

  const isReservation = (b: Reservation | ServiceBooking): b is Reservation => {
    return 'roomName' in b;
  };

  const fromDate = isReservation(booking) ? parseISO(booking.checkInDate) : (booking.date ? parseISO(booking.date) : new Date());
  const toDate = isReservation(booking) ? parseISO(booking.checkOutDate) : fromDate;
  const shortId = booking.id.substring(0, 7).toUpperCase();

  const transferBooking = isReservation(booking)
    ? booking.serviceBookings?.find((sb: ServiceBooking) => sb.type === 'airport_transfer')
    : (booking.serviceType === 'airport_transfer' ? booking : undefined);

  const totalPrice = isReservation(booking) ? booking.totalPrice : (booking.total || 0);
  const title = isReservation(booking) ? booking.roomName : (booking.serviceType === 'excursion' ? 'Excursion' : (booking.serviceType || 'Service'));

  return (
    <div className="bg-shpc-sand min-h-screen font-sans text-shpc-ink">
      {/* Header */}
      <header className="relative h-[40vh] min-h-[300px] flex flex-col items-center justify-center text-center text-white p-6">
        <Image
          src="/home-hero.png"
          alt="Luxury Resort"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
          <div className="bg-white rounded-full p-2 mb-6 shadow-lg">
            <CheckCircle className="h-12 w-12 text-green-500 fill-green-50" />
          </div>
          <h1 className="text-3xl md:text-5xl font-playfair font-bold mb-4 tracking-tight">
            {(!isReservation(booking) && booking.serviceType === 'excursion')
              ? "Your Experience is locked in"
              : `Pack your bags ${booking.guestName} your booking is confirmed!`}
          </h1>
          {(!isReservation(booking) && booking.serviceType === 'excursion') ? null : (
            <p className="text-lg md:text-xl font-light opacity-95 max-w-2xl">
              We are thrilled to confirm your reservation at our beautiful Punta Cana guest house!
            </p>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-24 space-y-8">

        <div id="confirmation-content" className="space-y-8">
          {/* Reservation Details (Main Card) */}
          <Card className="shadow-soft rounded-3xl overflow-hidden border-none bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-shpc-yellow/10 border-b border-shpc-yellow/20 p-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-playfair text-shpc-ink">
                <span>✅</span> Reservation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-4 flex-grow">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Reservation ID</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-shpc-ink tracking-tight">{shortId}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Guest Name</p>
                      <p className="text-lg font-medium">{booking.guestName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Confirmation Sent To</p>
                      <p className="text-lg font-medium truncate" title={isReservation(booking) ? booking.guestEmail : booking.email}>{isReservation(booking) ? booking.guestEmail : booking.email}</p>
                      {(isReservation(booking) ? booking.guestPhone : booking.phone) && (
                        <p className="text-sm text-muted-foreground mt-1">{isReservation(booking) ? booking.guestPhone : booking.phone}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Guest House</p>
                      <p className="text-lg font-medium">Sweet Home Punta Cana</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 bg-shpc-sand/50 p-4 rounded-xl border border-shpc-edge">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <QRCode value={`${shortId}-${title}`} size={100} />
                  </div>
                  <p className="text-xs text-center text-muted-foreground max-w-[140px] leading-tight">
                    📌 Keep this ID and QR Code handy for quick check-in!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Stay & Room OR Excursion Details */}
          {isReservation(booking) ? (
            <Card className="shadow-soft rounded-3xl overflow-hidden border-none bg-white">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xl font-playfair flex items-center gap-2">
                  📅 Your Stay & Room
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-shpc-yellow" /> Dates</p>
                    <p className="font-medium text-lg">{format(fromDate, "MMM dd")} – {format(toDate, "MMM dd, yyyy")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><UsersIcon className="w-4 h-4 text-shpc-yellow" /> Guests</p>
                    <p className="font-medium text-lg">{booking.numberOfGuests} {booking.numberOfGuests === 1 ? "Guest" : "Guests"}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Home className="w-4 h-4 text-shpc-yellow" /> Room Type</p>
                    <p className="font-medium text-lg">{booking.roomName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-shpc-yellow" /> Check-in Time</p>
                    <p className="font-medium text-lg">3:00 PM</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-shpc-yellow" /> Check-out Time</p>
                    <p className="font-medium text-lg">11:00 AM</p>
                  </div>
                </div>
                {booking.room?.image && (
                  <div className="mt-8">
                    <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-md group">
                      <Image
                        src={booking.room.image}
                        alt={booking.roomName}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white font-playfair text-xl font-bold drop-shadow-md">
                        {booking.roomName}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : booking.serviceType === 'excursion' ? (
            <Card className="shadow-soft rounded-3xl overflow-hidden border-none bg-white">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xl font-playfair flex items-center gap-2">
                  🌴 Excursion Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="mt-4">
                  {booking.details && (() => {
                    try {
                      const details = JSON.parse(booking.details as string);
                      const allItems = [details.mainExcursion, ...(details.bundledItems || [])].filter(Boolean);

                      return (
                        <div className="space-y-8">
                          {allItems.map((item: any, index: number) => (
                            <div key={index} className={index > 0 ? "pt-8 border-t border-dashed border-neutral-200" : ""}>
                              {/* Title & Image */}
                              <div className="flex gap-4 mb-6">
                                {item.image && (
                                  <div className="relative h-20 w-24 shrink-0 rounded-xl overflow-hidden shadow-sm">
                                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                                  </div>
                                )}
                                <div className="space-y-1 py-1">
                                  <p className="text-sm text-muted-foreground flex items-center gap-2"><Home className="w-4 h-4 text-shpc-yellow" /> Adventure</p>
                                  <p className="font-medium text-lg leading-tight">{item.title}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date */}
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-shpc-yellow" /> Date</p>
                                  <p className="font-medium text-lg">
                                    {item.bookingDate ? format(parseISO(item.bookingDate), "EEEE, MMM dd, yyyy") : format(fromDate, "EEEE, MMM dd, yyyy")}
                                  </p>
                                </div>

                                {/* Guests */}
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground flex items-center gap-2"><UsersIcon className="w-4 h-4 text-shpc-yellow" /> Guests</p>
                                  <p className="font-medium text-lg">{item.adults ? `${item.adults} Adults` : booking.pax}</p>
                                </div>

                                {/* Duration */}
                                {item.practicalInfo?.duration && (
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-shpc-yellow" /> Duration</p>
                                    <p className="font-medium text-lg">{item.practicalInfo.duration}</p>
                                  </div>
                                )}

                                {/* Pickup Time */}
                                {item.practicalInfo?.departure && (
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-shpc-yellow" /> Pickup Time</p>
                                    <p className="font-medium text-lg">{item.practicalInfo.departure}</p>
                                  </div>
                                )}

                                {/* Meeting Point */}
                                {item.practicalInfo?.pickup && (
                                  <div className="space-y-1 md:col-span-2">
                                    <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4 text-shpc-yellow" /> Meeting Point</p>
                                    <p className="font-medium text-lg">{item.practicalInfo.pickup}</p>
                                    {item.practicalInfo.pickupMapLink && (
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <button
                                            className="text-sm font-medium text-blue-600 underline decoration-blue-600 underline-offset-4 mt-1 inline-block hover:text-blue-800 transition-colors text-left"
                                          >
                                            View Map & Instructions
                                          </button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[600px] bg-white p-0 overflow-hidden rounded-2xl">
                                          <DialogHeader className="p-6 pb-2">
                                            <DialogTitle className="font-playfair text-2xl">Walking Directions</DialogTitle>
                                          </DialogHeader>
                                          <div className="p-6 pt-2">
                                            <p className="text-sm text-muted-foreground mb-4">
                                              From <span className="font-semibold text-shpc-ink">Sweet Home Punta Cana</span> to <span className="font-semibold text-shpc-ink">{item.practicalInfo.pickup}</span>
                                            </p>
                                            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-sm border border-neutral-200">
                                              <EmbeddedMap
                                                mapUrl={item.practicalInfo.pickupMapLink}
                                                origin="Sweet Home Punta Cana"
                                                mode="walking"
                                                zoom={15}
                                              />
                                            </div>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    } catch (e) { return null; }
                  })()}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Airport Transfer Section */}
          {transferBooking && (() => {
            const details = transferBooking.details ? JSON.parse(transferBooking.details) : {};
            const isDeparture = details.direction === 'depart' || (details.direction === 'round' && details.departureDate);
            const isArrival = details.direction === 'arrive' || (details.direction === 'round' && details.arrivalDate);

            return (
              <Card className="shadow-soft rounded-3xl overflow-hidden border-none bg-white">
                <CardHeader className="bg-blue-50/50 p-6 border-b border-blue-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-playfair flex items-center gap-2 text-blue-900">
                        ✈️ Airport Transfer (Confirmed)
                      </CardTitle>
                      <p className="text-blue-700/80 text-sm mt-1">
                        We've arranged a seamless transfer to start your vacation the moment you land.
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100">
                      <QRCode value={`TRANSFER-${transferBooking.id}`} size={64} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Guests</p>
                      <p className="font-medium">{transferBooking.pax}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Transfer Date</p>
                      <p className="font-medium">{transferBooking.date ? format(parseISO(transferBooking.date), "MMM dd, yyyy") : "N/A"}</p>
                    </div>

                    {/* Airline - Show for Arrival */}
                    {details.arrivalAirline && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Airline</p>
                        <p className="font-medium">{details.arrivalAirline}</p>
                      </div>
                    )}

                    {/* Flight Number - Show for Arrival or Departure */}
                    {(details.arrivalFlight || details.departureFlight) && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Flight Number</p>
                        <p className="font-medium">
                          {details.arrivalFlight || details.departureFlight}
                        </p>
                      </div>
                    )}

                    {/* Pickup Time - Show ONLY for Departure */}
                    {isDeparture && details.departureTime && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Pickup Time</p>
                        <p className="font-medium">{details.departureTime} EST</p>
                      </div>
                    )}

                    <div className="space-y-1 sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Transfer Total</p>
                      <p className="font-medium text-lg">${transferBooking.total?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                    <div className="bg-blue-100 p-2 rounded-full h-fit">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-blue-900 text-sm">🌟 Peace of Mind Promise</p>
                      <p className="text-blue-800/80 text-sm mt-1 leading-relaxed">
                        Your driver will be waiting for you at the airport exit holding a sign with your name. We proactively track your flight for any delays, ensuring your pick-up is on time, every time.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Payment Summary */}
          <Card className="shadow-soft rounded-3xl overflow-hidden border-none bg-white">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xl font-playfair flex items-center gap-2">
                💰 Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-shpc-ink">
                  <span>Total Paid (USD)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground text-sm">
                  <span>Balance Due at Check-in</span>
                  <span>$0.00</span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Payment Processed On</p>
                  <p className="font-medium">{format(new Date(booking.createdAt), "MMM dd, yyyy")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cancellation Policy</p>
                  <p className="font-medium text-green-600">Free cancellation up to 48h before arrival.</p>
                </div>
              </div>

              <div className="bg-shpc-sand p-3 rounded-lg text-center">
                <p className="text-sm font-medium text-shpc-ink/80">✨ All taxes included, no hidden fees.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <div className="space-y-4">
          <h3 className="text-2xl font-playfair font-bold text-center text-shpc-ink">📝 Next Steps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              className="h-14 text-lg bg-white text-shpc-ink border-2 border-shpc-yellow hover:bg-shpc-yellow hover:text-white transition-all duration-300 rounded-xl shadow-sm"
              variant="outline"
              onClick={handleDownloadImage}
            >
              <Download className="mr-2 h-5 w-5" /> Download Invoice
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-14 text-lg bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90 transition-all duration-300 rounded-xl shadow-soft">
                  <CalendarPlus className="mr-2 h-5 w-5" /> Add to Calendar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => window.open(googleCalUrl(), "_blank")}>
                  Google Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadICS}>
                  Download .ics File
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="pt-8 print:hidden">
          <GuestServicesCarousel />
        </div>

        <div className="text-center p-6 bg-transparent print:hidden">
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
      </main>

      <div className="print-only hidden text-center p-8">
        <h3 className="text-lg font-bold">Sweet Home Punta Cana</h3>
        <p className="text-xs text-muted-foreground">
          www.sweethomepuntacana.com | +1 (809) 510-5465
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

import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO, parse } from "date-fns";
import Image from "next/image";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Home,
  ArrowRight,
  Info,
  Sailboat,
  Shirt,
  Plane as PlaneIcon,
  ShoppingBasket,
} from "lucide-react";
import {
  getServiceBookingById,
  getExcursionById,
} from "@/app/server-actions.readonly";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ServiceBooking, Excursion } from "@/lib/types";

export default async function ServiceBookingDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const booking = await getServiceBookingById(id);

  if (!booking) {
    notFound();
  }

  const excursionId = booking.excursionId || booking.details?.excursion?.id;

  let excursion: Excursion | null = null;
  if (
    (booking.type === "excursion" || booking.serviceType === "excursion") &&
    excursionId
  ) {
    excursion = await getExcursionById(excursionId);
  }

  const guestName = booking.customer?.name || booking.guestName;
  const email = booking.customer?.email || booking.email;
  const phone = booking.customer?.phone || booking.phone;
  const accommodation = booking.details?.accommodation || booking.accommodation;
  const serviceType = booking.type || booking.serviceType;
  const total = booking.pricing?.totalUSD || booking.total;

  const PageHeader = () => (
    <header className="flex items-center justify-between gap-4 mb-6">
      <Button asChild variant="ghost" size="icon">
        <Link href="/admin/guest-services">
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Back</span>
        </Link>
      </Button>
      <div className="text-center">
        <h1 className="text-xl font-bold text-shpc-ink">
          Service Booking Details
        </h1>
        <p className="text-sm text-muted-foreground">
          Booking ID: {booking.id.substring(0, 7)}
        </p>
      </div>
      <div className="w-10"></div>
    </header>
  );

  const GuestInfoCard = () => (
    <Card className="shadow-soft rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" /> Guest Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Guest Name</span>
          <span className="font-medium">{guestName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Email</span>
          <span className="font-medium">{email || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Phone</span>
          <span className="font-medium">{phone || "N/A"}</span>
        </div>
        {accommodation && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Accommodation</span>
            <span className="font-medium text-right">{accommodation}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Handle Excursion bookings
  if (serviceType.toLowerCase().includes("excursion") && excursion) {
    const adults = booking.details?.pax
      ? parseInt(booking.details.pax.match(/(\d+)/)?.[0] || "1", 10)
      : 1;
    const price = total;

    return (
      <div className="p-4 sm:p-6 bg-shpc-sand min-h-screen">
        <PageHeader />
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex gap-4 items-start p-4 rounded-2xl border bg-white shadow-soft">
            <Image
              src={excursion.image}
              alt={excursion.title}
              width={120}
              height={90}
              className="rounded-lg object-cover aspect-[4/3]"
              data-ai-hint="vacation excursion"
            />
            <div className="flex-grow">
              <p className="font-semibold text-lg">{excursion.title}</p>
              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />{" "}
                  {booking.details?.excursion?.date
                    ? format(
                        parseISO(booking.details.excursion.date),
                        "EEEE, MMM dd, yyyy"
                      )
                    : "Date not set"}
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />{" "}
                  {excursion.practicalInfo.duration} (Departure:{" "}
                  {excursion.practicalInfo.departure})
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />{" "}
                  {excursion.practicalInfo.pickup}
                </p>
              </div>
            </div>
          </div>

          <GuestInfoCard />

          <Card className="shadow-soft rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sailboat className="h-5 w-5" /> Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Guests</span>
                <span className="font-medium">{booking.details?.pax}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">${price?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground pt-2">
                <span>Taxes & Fees</span>
                <span>Included</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-xl">
                <span>Total Paid (USD)</span>
                <span>${price?.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Button asChild size="sm" className="w-full">
            <Link
              href={`/admin/excursions/edit/${excursion.slug}`}
              target="_blank"
            >
              Manage Excursion <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Handle Laundry Service
  if (serviceType.toLowerCase().includes("laundry")) {
    const qty = booking.details?.qty || booking.qty;
    const time = booking.details?.time || booking.time;
    const date = booking.details?.date || booking.date;
    return (
      <div className="p-4 sm:p-6 bg-shpc-sand min-h-screen">
        <PageHeader />
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="shadow-soft rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <User className="h-5 w-5" /> {guestName}
                </span>
                <span className="text-base font-medium flex items-center gap-2">
                  <Home className="h-4 w-4" /> {accommodation}
                </span>
              </CardTitle>
              <CardDescription>
                {date
                  ? format(parseISO(date), "EEEE, MMMM dd, yyyy")
                  : "Date not set"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center bg-primary/10 border-2 border-dashed border-primary/20 rounded-2xl p-6">
                <div>
                  <p className="text-5xl font-bold text-primary">{qty}</p>
                  <p className="text-muted-foreground -mt-1">
                    {qty > 1 ? "Loads" : "Load"}
                  </p>
                </div>
                <div>
                  <p className="text-5xl font-bold text-primary">
                    {time
                      ? format(parse(time, "HH:mm", new Date()), "h:mm")
                      : "--:--"}
                  </p>
                  <p className="text-muted-foreground -mt-1">
                    {time
                      ? format(parse(time, "HH:mm", new Date()), "a")
                      : "Pickup Time"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" /> Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{email || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{phone || "N/A"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle other service bookings (e.g. Airport Transfer)
  const direction = booking.details?.direction;
  const isArrival = direction?.toLowerCase().includes("arr");
  const isDeparture = direction?.toLowerCase().includes("dep");

  const getServiceIcon = () => {
    if (serviceType.toLowerCase().includes("laundry"))
      return <Shirt className="h-6 w-6" />;
    if (serviceType.toLowerCase().includes("transfer"))
      return <PlaneIcon className="h-6 w-6" />;
    return <Info className="h-6 w-6" />;
  };

  const renderBookingDate = () => {
    const arrivalDate = booking.details?.arrivalDate;
    const departureDate = booking.details?.departureDate;
    const departureTime = booking.details?.departureTime;
    const date = booking.details?.date;

    if (isDeparture) {
      return `Pickup time: ${
        departureDate
          ? format(parseISO(departureDate), "MMM dd, yyyy")
          : "Date not set"
      } at ${
        departureTime
          ? format(parse(departureTime, "HH:mm", new Date()), "h:mm a")
          : ""
      }`;
    }
    return date
      ? format(parseISO(date), "EEEE, MMM dd, yyyy")
      : arrivalDate
      ? format(parseISO(arrivalDate), "EEEE, MMM dd, yyyy")
      : "Date not set";
  };

  return (
    <div className="p-4 sm:p-6 bg-shpc-sand min-h-screen">
      <PageHeader />
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="shadow-soft rounded-2xl">
          <CardHeader className="flex-row items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              {getServiceIcon()}
            </div>
            <div>
              <CardTitle>{serviceType}</CardTitle>
              <CardDescription>{renderBookingDate()}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Separator />
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">
                  GUEST
                </p>
                <p className="text-lg font-bold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {guestName}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">
                  PHONE
                </p>
                <p className="text-lg font-bold flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  {phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">
                  {isArrival ? "ARRIVAL FLIGHT" : "DEPARTURE FLIGHT"}
                </p>
                <p className="text-lg font-bold">
                  {isArrival
                    ? booking.details?.arrivalFlight
                    : booking.details?.departureFlight || "N/A"}
                </p>
              </div>
              {isDeparture && booking.details?.departureTime && (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">
                    PICKUP TIME
                  </p>
                  <p className="text-lg font-bold">
                    {format(
                      parse(booking.details.departureTime, "HH:mm", new Date()),
                      "h:mm a"
                    )}
                  </p>
                </div>
              )}
            </div>
            {booking.details && typeof booking.details === "string" && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-base mb-2">
                  Additional Details
                </h3>
                <p className="text-muted-foreground">{booking.details}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <GuestInfoCard />
      </div>
    </div>
  );
}

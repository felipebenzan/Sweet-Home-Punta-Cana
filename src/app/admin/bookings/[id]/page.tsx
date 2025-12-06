import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO, differenceInDays } from "date-fns";
import {
  getReservationById,
  getServiceBookingById,
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
import {
  ChevronLeft,
  User,
  Calendar as CalendarIcon,
  Bed,
  Mail,
  Phone,
  DollarSign,
  Clock,
  Briefcase,
  Shirt,
  Plane,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0;

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Try to find as a Room Reservation first
  const reservation = await getReservationById(id);

  if (reservation) {
    const fromDate = parseISO(reservation.checkInDate);
    const toDate = parseISO(reservation.checkOutDate);
    const nights = differenceInDays(toDate, fromDate);

    return (
      <div className="p-4 sm:p-6 bg-shpc-sand min-h-screen">
        <BookingHeader id={id} title="Room Reservation" />

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="shadow-soft rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{reservation.roomName}</span>
                <StatusBadge status={reservation.status} />
              </CardTitle>
              <CardDescription className="flex items-center gap-4 pt-1">
                <span className="flex items-center gap-1.5">
                  <Bed className="h-4 w-4" /> For {reservation.numberOfGuests}{" "}
                  guests
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {nights} nights
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" /> Check-in
                </span>
                <span className="font-medium">
                  {format(fromDate, "EEEE, MMM dd, yyyy")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" /> Check-out
                </span>
                <span className="font-medium">
                  {format(toDate, "EEEE, MMM dd, yyyy")}
                </span>
              </div>
            </CardContent>
          </Card>

          <GuestInfoCard
            name={reservation.guestName}
            email={reservation.guestEmail}
            phone={reservation.guestPhone}
          />

          <Card className="shadow-soft rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Room Total ({nights} nights)
                </span>
                <span className="font-medium">
                  ${reservation.totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground pt-2">
                <span>Taxes & Fees</span>
                <span>Included</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-xl">
                <span>Total Paid (USD)</span>
                <span>${reservation.totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If not a reservation, try Service Booking
  const serviceBooking = await getServiceBookingById(id);

  if (!serviceBooking) {
    notFound();
  }

  // Parse details for Service Booking
  let details: any = {};
  try {
    // @ts-ignore
    details = typeof serviceBooking.details === 'string' ? JSON.parse(serviceBooking.details) : serviceBooking.details || {};
  } catch (e) {
    console.error("Failed to parse details", e);
  }

  const serviceDate = serviceBooking.date ? parseISO(serviceBooking.date) : null;
  const serviceIcon = getServiceIcon(serviceBooking.type);
  const serviceTitle = formatServiceType(serviceBooking.type);
  const total = serviceBooking.total || 0;

  return (
    <div className="p-4 sm:p-6 bg-shpc-sand min-h-screen">
      <BookingHeader id={id} title={serviceTitle} />

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {serviceIcon} {serviceTitle}
              </span>
              <StatusBadge status={serviceBooking.status} />
            </CardTitle>
            {serviceBooking.pax && (
              <CardDescription className="flex items-center gap-4 pt-1">
                {serviceBooking.pax}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {serviceDate && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" /> Date
                </span>
                <span className="font-medium">
                  {format(serviceDate, "EEEE, MMM dd, yyyy")}
                </span>
              </div>
            )}

            {/* Service Specific Details */}
            {serviceBooking.type === 'laundry' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Shirt className="h-4 w-4" /> Bags
                  </span>
                  <span className="font-medium">{details.bags}</span>
                </div>
                {details.pickupTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Pickup Time
                    </span>
                    <span className="font-medium">{details.pickupTime}</span>
                  </div>
                )}
                {details.roomNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Bed className="h-4 w-4" /> Room
                    </span>
                    <span className="font-medium">{details.roomNumber}</span>
                  </div>
                )}
                {details.specialInstructions && (
                  <div className="pt-2">
                    <span className="text-muted-foreground flex items-center gap-2 mb-1">
                      Note:
                    </span>
                    <span className="italic block bg-muted p-2 rounded">{details.specialInstructions}</span>
                  </div>
                )}
              </>
            )}

            {serviceBooking.type === 'airport_transfer' && (
              <>
                {/* Add transfer details here if needed */}
              </>
            )}

          </CardContent>
        </Card>

        <GuestInfoCard
          name={serviceBooking.guestName}
          email={serviceBooking.email}
          phone={serviceBooking.phone}
        />

        <Card className="shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Total</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground pt-2">
              <span>Taxes & Fees</span>
              <span>Included</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-xl">
              <span>Total Paid (USD)</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Subcomponents ---

function BookingHeader({ id, title }: { id: string; title: string }) {
  return (
    <header className="flex items-center justify-between gap-4 mb-6">
      <Button asChild variant="ghost" size="icon">
        <Link href="/admin/bookings">
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Back to Bookings</span>
        </Link>
      </Button>
      <div className="text-center">
        <h1 className="text-xl font-bold text-shpc-ink">{title}</h1>
        <p className="text-sm text-muted-foreground">
          ID: {id.substring(0, 7).toUpperCase()}
        </p>
      </div>
      <div className="w-10"></div>
    </header>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  return (
    <Badge
      variant={status.toLowerCase() === "confirmed" ? "default" : "secondary"}
    >
      {status}
    </Badge>
  );
}

function GuestInfoCard({
  name,
  email,
  phone,
}: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}) {
  return (
    <Card className="shadow-soft rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" /> Guest Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Name</span>
          <span className="font-medium">{name || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Email</span>
          <span className="font-medium">{email || "N/A"}</span>
        </div>
        {phone && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium">{phone}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatServiceType(type: string) {
  switch (type) {
    case "airport_transfer":
      return "Airport Transfer";
    case "excursion":
      return "Excursion";
    case "laundry":
      return "Laundry Service";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

function getServiceIcon(type: string) {
  switch (type) {
    case "airport_transfer":
      return <Briefcase className="h-5 w-5" />; // Or Car/Plane
    case "excursion":
      return <Plane className="h-5 w-5" />; // Or Tree/Sun
    case "laundry":
      return <Shirt className="h-5 w-5" />;
    default:
      return <Briefcase className="h-5 w-5" />;
  }
}

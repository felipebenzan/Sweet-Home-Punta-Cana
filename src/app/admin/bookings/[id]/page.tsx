import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO, differenceInDays } from "date-fns";
import { getReservationById } from "@/app/server-actions.readonly";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Reservation } from "@/lib/types";
import {
  ChevronLeft,
  User,
  Calendar as CalendarIcon,
  Bed,
  Users as UsersIcon,
  Mail,
  Phone,
  DollarSign,
  Clock,
  Hash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0;

export default async function ReservationDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const reservation = await getReservationById(id);

  if (!reservation) {
    notFound();
  }

  const fromDate = parseISO(reservation.checkInDate);
  const toDate = parseISO(reservation.checkOutDate);
  const nights = differenceInDays(toDate, fromDate);

  return (
    <div className="p-4 sm:p-6 bg-shpc-sand min-h-screen">
      <header className="flex items-center justify-between gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/bookings">
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Back to Bookings</span>
          </Link>
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-shpc-ink">
            Reservation Details
          </h1>
          <p className="text-sm text-muted-foreground">
            ID: {reservation.id.substring(0, 7).toUpperCase()}
          </p>
        </div>
        <div className="w-10"></div>
      </header>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{reservation.roomName}</span>
              <Badge
                variant={
                  reservation.status.toLowerCase() === "confirmed"
                    ? "default"
                    : "secondary"
                }
              >
                {reservation.status}
              </Badge>
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

        <Card className="shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Guest Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{reservation.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{reservation.guestEmail}</span>
            </div>
          </CardContent>
        </Card>

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

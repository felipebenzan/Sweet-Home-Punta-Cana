"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Download,
  Home,
  PlaneLanding,
  PlaneTakeoff,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import * as htmlToImage from "html-to-image";
import { getServiceBookingById } from "@/server-actions";
import type { ServiceBooking } from "@/lib/types";

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bid = searchParams.get("bid");
  const [booking, setBooking] = useState<ServiceBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!bid) {
      setIsLoading(false);
      return;
    }

    async function fetchBooking() {
      try {
        const data = await getServiceBookingById(bid);
        console.log("Fetched booking data:", data);
        console.log("Booking ID:", bid);
        setBooking(data);
      } catch (error) {
        console.error("Failed to fetch booking details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBooking();
  }, [bid]);

  const handleDownload = () => {
    const node = document.getElementById("transfer-ticket");
    if (node) {
      htmlToImage
        .toPng(node, {
          backgroundColor: "#F9F7F2",
          pixelRatio: 2,
        })
        .then(function (dataUrl) {
          const link = document.createElement("a");
          link.download = `shpc-transfer-ticket-${booking?.id}.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch(function (error) {
          console.error("oops, something went wrong!", error);
        });
    }
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

  const {
    id,
    guestName,
    email,
    direction,
    total,
    arrivalDate,
    departureDate,
    arrivalFlight,
    departureFlight,
    departureTime,
  } = booking;
  const shortId = id.substring(0, 7).toUpperCase();
  const isArrival = direction === "arrive" || direction === "round";
  const isDeparture = direction === "depart" || direction === "round";

  const arrivalDateFormatted =
    isArrival && arrivalDate
      ? format(parseISO(arrivalDate), "EEE, MMM dd, yyyy")
      : null;
  const departureDateFormatted =
    isDeparture && departureDate
      ? format(parseISO(departureDate), "EEE, MMM dd, yyyy")
      : null;
  const departureTimeFormatted =
    isDeparture && departureTime
      ? format(parse(departureTime, "HH:mm", new Date()), "h:mm a")
      : null;

  return (
    <div className="bg-shpc-sand min-h-screen py-12 px-4 sm:px-6 lg:px-8 pt-[calc(var(--header-height)+3rem)]">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-shpc-ink">
            Transfer Confirmed!
          </h1>
          <p className="text-muted-foreground mt-2">
            Thank you, {guestName}. We've received your transfer request. A
            confirmation has been sent to {email}.
          </p>
        </div>

        <div
          id="transfer-ticket"
          className="bg-white rounded-2xl shadow-soft font-sans"
        >
          <div className="p-6 text-center border-b-2 border-dashed border-gray-300">
            <h2 className="text-xl font-bold text-shpc-ink tracking-wide">
              AIRPORT TRANSFER PASS
            </h2>
            <p className="text-sm text-muted-foreground">
              Booking ID: {shortId}
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Passenger</p>
              <p className="font-bold text-lg text-shpc-ink">{guestName}</p>
            </div>

            {isArrival && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-3 text-primary">
                  <PlaneLanding className="h-6 w-6" />
                  <p className="font-bold">Arrival from PUJ</p>
                </div>
                <div className="text-sm text-primary-foreground/80 mt-2 pl-9">
                  <p>
                    <strong>Date:</strong> {arrivalDateFormatted}
                  </p>
                  <p>
                    <strong>Flight:</strong> {arrivalFlight || "TBD"}
                  </p>
                </div>
              </div>
            )}

            {isDeparture && (
              <div className="p-4 bg-secondary/60 rounded-lg">
                <div className="flex items-center gap-3 text-secondary-foreground">
                  <PlaneTakeoff className="h-6 w-6" />
                  <p className="font-bold">Departure to PUJ</p>
                </div>
                <div className="text-sm text-secondary-foreground/80 mt-2 pl-9">
                  <p>
                    <strong>Date:</strong> {departureDateFormatted}
                  </p>
                  <p>
                    <strong>Pickup Time:</strong> {departureTimeFormatted}
                  </p>
                  <p>
                    <strong>Flight:</strong> {departureFlight || "TBD"}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="p-6 text-center border-t-2 border-dashed border-gray-300">
            <p className="text-muted-foreground text-sm">TOTAL PAID</p>
            <p className="text-3xl font-bold text-shpc-ink">
              ${total?.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-10 text-center flex flex-col sm:flex-row gap-2">
          <Button onClick={handleDownload} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Pass
          </Button>
          <Button asChild className="w-full">
            <Link href="/guest-services">
              <Home className="mr-2 h-4 w-4" />
              Back to Services
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
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}

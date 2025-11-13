"use client";
import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Home,
  User,
  ShoppingBasket,
  Clock,
  Download,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import * as htmlToImage from "html-to-image";
import { getServiceBookingById } from "@/server-actions";
import type { ServiceBooking } from "@/lib/types";

function ConfirmationDetails() {
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
    const node = document.getElementById("laundry-ticket");
    if (node) {
      htmlToImage
        .toPng(node, {
          backgroundColor: "#F9F7F2",
          pixelRatio: 2,
        })
        .then(function (dataUrl) {
          const link = document.createElement("a");
          link.download = `shpc-laundry-ticket-${booking?.id}.png`;
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

  const { guestName, accommodation, qty, date, time, total, id } = booking;

  const formattedDate = date ? format(parseISO(date), "EEEE, MMMM do") : "N/A";
  const formattedTime = time
    ? parse(time, "HH:mm", new Date()).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "N/A";
  const shortId = id.substring(0, 7).toUpperCase();

  const numberToWord = (num: number) => {
    const words = ["Zero", "One", "Two", "Three", "Four", "Five"];
    return words[num] || String(num);
  };

  return (
    <div className="bg-shpc-sand min-h-screen py-12 px-4 sm:px-6 lg:px-8 pt-[calc(var(--header-height)+3rem)]">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-shpc-ink">
            Request Confirmed!
          </h1>
          <p className="text-muted-foreground mt-2">
            Thank you, {guestName}. We've received your laundry request. Please
            keep a copy of your ticket.
          </p>
        </div>

        <div
          id="laundry-ticket"
          className="bg-white rounded-2xl shadow-soft font-mono"
        >
          <div className="p-6 text-center border-b-2 border-dashed border-gray-300">
            <h2 className="text-2xl font-bold text-shpc-ink tracking-widest">
              LAUNDRY SERVICE
            </h2>
            <p className="text-sm text-muted-foreground font-sans">
              Admit {numberToWord(qty || 1)} (
              {qty === 1 ? "Laundry Bag" : "Laundry Bags"})
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                NAME
              </span>
              <span className="font-bold text-shpc-ink">{guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm flex items-center gap-2">
                <Home className="h-4 w-4" />
                ROOM
              </span>
              <span className="font-bold text-shpc-ink">{accommodation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm flex items-center gap-2">
                <ShoppingBasket className="h-4 w-4" />
                LOADS
              </span>
              <span className="font-bold text-shpc-ink">{qty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                PICKUP
              </span>
              <span className="font-bold text-shpc-ink text-right">
                {formattedDate}
                <br />@ {formattedTime}
              </span>
            </div>
          </div>
          <div className="p-6 text-center border-t-2 border-dashed border-gray-300">
            <p className="text-muted-foreground text-sm">TOTAL</p>
            <p className="text-3xl font-bold text-shpc-ink">
              ${total?.toFixed(2)}
            </p>
          </div>
          <div className="bg-shpc-ink text-white p-4 rounded-b-2xl text-center">
            <p className="font-semibold text-sm tracking-wider">
              TICKET ID: {shortId}
            </p>
          </div>
        </div>

        <div className="mt-10 text-center flex flex-col sm:flex-row gap-2">
          <Button onClick={handleDownload} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Ticket
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

export default function LaundryConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-shpc-sand">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ConfirmationDetails />
    </Suspense>
  );
}

"use server";

import { prisma } from "@/lib/prisma";
import type { Excursion, Room, Reservation, ServiceBooking } from "@/lib/types";

/* -------------------- 🔹 HELPERS -------------------- */

function mapRoom(room: any): Room {
  return {
    ...room,
    amenities: JSON.parse(room.amenities),
    gallery: room.gallery ? JSON.parse(room.gallery) : undefined,
  };
}

function mapExcursion(excursion: any): Excursion {
  return {
    ...excursion,
    inclusions: JSON.parse(excursion.inclusions),
    practicalInfo: {
      departure: excursion.departure,
      duration: excursion.duration,
      pickup: excursion.pickup,
      pickupMapLink: excursion.pickupMapLink,
      notes: JSON.parse(excursion.notes),
    },
    gallery: JSON.parse(excursion.gallery),
    price: { adult: excursion.priceAdult },
  };
}

/* -------------------- 🔹 ROOMS -------------------- */

export async function getRooms(): Promise<Room[]> {
  console.log("✅ Fetching rooms from SQLite (readonly)");
  const rooms = await prisma.room.findMany();
  return rooms.map(mapRoom);
}

export async function checkRoomAvailability({
  from,
  to,
}: {
  from: string;
  to: string;
}): Promise<string[]> {
  console.log(`✅ Checking room availability from ${from} to ${to}`);

  const allRooms = await prisma.room.findMany();

  const conflictingReservations = await prisma.reservation.findMany({
    where: {
      status: "Confirmed",
      OR: [
        {
          checkInDate: { lte: new Date(to) },
          checkOutDate: { gte: new Date(from) }
        }
      ]
    }
  });

  const bookedRoomIds = new Set(conflictingReservations.map((r: { roomId: string }) => r.roomId));

  return allRooms
    .filter((room: { id: string }) => !bookedRoomIds.has(room.id))
    .map((room: { id: string }) => room.id);
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  console.log(`✅ Fetching room by slug: ${slug}`);
  const room = await prisma.room.findUnique({ where: { slug } });
  return room ? mapRoom(room) : null;
}

/* -------------------- 🔹 EXCURSIONS -------------------- */

export async function getExcursions(): Promise<Excursion[]> {
  console.log("✅ Fetching excursions from SQLite");
  const excursions = await prisma.excursion.findMany();
  return excursions.map(mapExcursion);
}

export async function getExcursionBySlug(
  slug: string
): Promise<Excursion | null> {
  console.log(`✅ Fetching excursion by slug: ${slug}`);
  const excursion = await prisma.excursion.findUnique({ where: { slug } });
  return excursion ? mapExcursion(excursion) : null;
}

export async function getExcursionById(id: string): Promise<Excursion | null> {
  console.log(`✅ Fetching excursion by ID: ${id}`);
  const excursion = await prisma.excursion.findUnique({ where: { id } });
  return excursion ? mapExcursion(excursion) : null;
}

/* -------------------- 🔹 RESERVATIONS -------------------- */

export async function getReservations(): Promise<Reservation[]> {
  console.log("✅ Fetching reservations from SQLite");
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return reservations.map((r: any) => ({
    ...r,
    checkInDate: r.checkInDate.toISOString(),
    checkOutDate: r.checkOutDate.toISOString(),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    roomName: "Unknown Room",
    status: r.status as 'Confirmed' | 'Pending' | 'Cancelled'
  }));
}

export async function getReservationById(
  id: string
): Promise<Reservation | null> {
  console.log(`✅ Fetching reservation by id: ${id}`);
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { room: true }
  });

  if (!reservation) return null;

  return {
    ...reservation,
    checkInDate: reservation.checkInDate.toISOString(),
    checkOutDate: reservation.checkOutDate.toISOString(),
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
    roomName: reservation.room.name,
    status: reservation.status as 'Confirmed' | 'Pending' | 'Cancelled'
  };
}

/* -------------------- 🔹 SERVICE BOOKINGS -------------------- */

export async function getServiceBookings(): Promise<ServiceBooking[]> {
  console.log("✅ Fetching service bookings from SQLite");
  const bookings = await prisma.serviceBooking.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return bookings.map((b: any) => ({
    ...b,
    date: b.date ? b.date.toISOString() : undefined,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    email: b.email || undefined,
    phone: b.phone || undefined,
  }));
}

export async function getServiceBookingById(
  id: string
): Promise<ServiceBooking | null> {
  console.log(`✅ Fetching service booking by ID: ${id}`);
  const booking = await prisma.serviceBooking.findUnique({
    where: { id }
  });

  if (!booking) return null;

  return {
    ...booking,
    date: booking.date ? booking.date.toISOString() : undefined,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    email: booking.email || undefined,
    phone: booking.phone || undefined,
  };
}

/* -------------------- 🔹 RESERVATIONS by ROOM -------------------- */

export async function getReservationsByRoomId(
  roomId: string
): Promise<Reservation[]> {
  console.log(`✅ Fetching reservations by room id: ${roomId}`);
  const reservations = await prisma.reservation.findMany({
    where: { roomId },
    orderBy: { checkInDate: 'asc' }
  });

  return reservations.map((r: any) => ({
    ...r,
    checkInDate: r.checkInDate.toISOString(),
    checkOutDate: r.checkOutDate.toISOString(),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    roomName: "Unknown",
    status: r.status as 'Confirmed' | 'Pending' | 'Cancelled'
  }));
}
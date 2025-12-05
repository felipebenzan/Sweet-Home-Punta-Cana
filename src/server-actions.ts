"use server";

import { prisma } from "@/lib/prisma";
import type { Excursion, Room, Reservation, ServiceBooking } from "@/lib/types";
import { parseISO, isWithinInterval } from "date-fns";

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
        price: { adult: excursion.priceAdult }, // Map flat price back to object structure
    };
}

/* -------------------- 🔹 ROOMS -------------------- */

export async function getRooms(): Promise<Room[]> {
    console.log("✅ Fetching rooms from SQLite");
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

    // Get all rooms
    const allRooms = await prisma.room.findMany();

    // Find reservations that overlap with the requested dates
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

    // Return IDs of rooms that are NOT booked
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

    // Map Prisma result to Reservation interface
    return reservations.map((r: any) => ({
        ...r,
        checkInDate: r.checkInDate.toISOString(),
        checkOutDate: r.checkOutDate.toISOString(),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        roomName: "Unknown Room", // We might need to fetch this or include it in the query
        status: r.status as 'Confirmed' | 'Pending' | 'Cancelled'
    }));
}

export async function getReservationById(
    id: string
): Promise<Reservation | null> {
    console.log(`✅ Fetching reservation by id: ${id}`);
    const reservation = await prisma.reservation.findUnique({
        where: { id },
        include: { room: true, serviceBookings: true }
    });

    if (!reservation) return null;

    return {
        ...reservation,
        checkInDate: reservation.checkInDate.toISOString(),
        checkOutDate: reservation.checkOutDate.toISOString(),
        createdAt: reservation.createdAt.toISOString(),
        updatedAt: reservation.updatedAt.toISOString(),
        roomName: reservation.room.name,
        status: reservation.status as 'Confirmed' | 'Pending' | 'Cancelled',
        guestPhone: reservation.guestPhone || undefined,
        serviceBookings: reservation.serviceBookings.map((sb: any) => ({
            ...sb,
            date: sb.date ? sb.date.toISOString() : undefined,
            createdAt: sb.createdAt.toISOString(),
            updatedAt: sb.updatedAt.toISOString(),
            email: sb.email || undefined,
            phone: sb.phone || undefined,
            serviceType: sb.serviceType || undefined,
            details: sb.details || undefined,
        })),
    };
}

export async function createReservation(data: any): Promise<Reservation> {
    console.log("✅ Creating new reservation in SQLite", data);
    const newReservation = await prisma.reservation.create({
        data: {
            roomId: data.roomId,
            guestName: data.guestName,
            guestEmail: data.guestEmail,
            checkInDate: new Date(data.checkInDate),
            checkOutDate: new Date(data.checkOutDate),
            numberOfGuests: data.numberOfGuests,
            totalPrice: data.totalPrice,
            status: "Confirmed"
        },
        include: { room: true }
    });

    return {
        ...newReservation,
        checkInDate: newReservation.checkInDate.toISOString(),
        checkOutDate: newReservation.checkOutDate.toISOString(),
        createdAt: newReservation.createdAt.toISOString(),
        updatedAt: newReservation.updatedAt.toISOString(),
        roomName: newReservation.room.name,
        status: newReservation.status as 'Confirmed' | 'Pending' | 'Cancelled'
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
        serviceType: b.serviceType || undefined,
        details: b.details || undefined,
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
        time: booking.time || undefined,
        qty: booking.qty || undefined,
        total: booking.total || undefined,
        email: booking.email || undefined,
        phone: booking.phone || undefined,
        serviceType: booking.serviceType || undefined,
        details: (booking as any).details || undefined,
        excursionId: booking.excursionId || undefined,
        serviceId: (booking as any).serviceId || undefined,
        accommodation: (booking as any).accommodation || undefined,
        bookingId: (booking as any).bookingId || undefined,
        reservationId: booking.reservationId || undefined,
        pax: booking.pax || undefined,
    };
}

export async function createServiceBooking(data: any): Promise<ServiceBooking> {
    console.log("✅ Creating service booking in SQLite", data);

    const newBooking = await prisma.serviceBooking.create({
        data: {
            type: data.type,
            serviceType: data.serviceType || data.type,
            excursionId: data.excursionId,
            guestName: data.guestName || data.customer?.name,
            email: data.email || data.customer?.email,
            phone: data.phone || data.customer?.phone,
            date: data.date ? new Date(data.date) : undefined,
            total: data.total || data.pricing?.totalUSD,
            pax: data.pax,
            status: "Confirmed"
        }
    });

    return {
        ...newBooking,
        date: newBooking.date ? newBooking.date.toISOString() : undefined,
        createdAt: newBooking.createdAt.toISOString(),
        updatedAt: newBooking.updatedAt.toISOString(),
        time: newBooking.time || undefined,
        qty: newBooking.qty || undefined,
        total: newBooking.total || undefined,
        email: newBooking.email || undefined,
        phone: newBooking.phone || undefined,
        serviceType: newBooking.serviceType || undefined,
        details: (newBooking as any).details || undefined,
        excursionId: newBooking.excursionId || undefined,
        serviceId: (newBooking as any).serviceId || undefined,
        accommodation: (newBooking as any).accommodation || undefined,
        bookingId: (newBooking as any).bookingId || undefined,
        reservationId: newBooking.reservationId || undefined,
        pax: newBooking.pax || undefined,
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
        roomName: "Unknown", // Or fetch if needed
        status: r.status as 'Confirmed' | 'Pending' | 'Cancelled'
    }));
}

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
  // FORCE OVERRIDE: Ensure Saona Island uses local images regardless of DB state
  if (excursion.slug === 'saona-island') {
    return {
      ...excursion,
      inclusions: typeof excursion.inclusions === 'string' ? JSON.parse(excursion.inclusions) : excursion.inclusions,
      practicalInfo: {
        departure: excursion.departure,
        duration: excursion.duration,
        pickup: excursion.pickup,
        pickupMapLink: excursion.pickupMapLink,
        notes: typeof excursion.notes === 'string' ? JSON.parse(excursion.notes) : excursion.notes,
      },
      gallery: [
        '/saona-3.jpeg',
        '/saona-2.jpeg',
        '/saona-4.jpeg'
      ],
      image: '/saona-hero.png',
      price: { adult: excursion.priceAdult },
    };
  }

  // FORCE OVERRIDE: Buggy Adventure
  if (excursion.slug === 'buggy-adventure') {
    return {
      ...excursion,
      inclusions: typeof excursion.inclusions === 'string' ? JSON.parse(excursion.inclusions) : excursion.inclusions,
      practicalInfo: {
        departure: excursion.departure,
        duration: excursion.duration,
        pickup: excursion.pickup,
        pickupMapLink: excursion.pickupMapLink,
        notes: typeof excursion.notes === 'string' ? JSON.parse(excursion.notes) : excursion.notes,
      },
      gallery: [
        '/buggies-hero.png',
        '/buggies-1.jpeg',
        '/buggies-2.jpeg',
        '/buggies-3.jpeg'
      ],
      image: '/buggies-hero.png',
      price: { adult: excursion.priceAdult },
    };
  }

  // FORCE OVERRIDE: Santo Domingo
  if (excursion.slug === 'santo-domingo' || excursion.title.includes('Santo Domingo')) {
    return {
      ...excursion,
      inclusions: typeof excursion.inclusions === 'string' ? JSON.parse(excursion.inclusions) : excursion.inclusions,
      practicalInfo: {
        departure: excursion.departure,
        duration: excursion.duration,
        pickup: excursion.pickup,
        pickupMapLink: excursion.pickupMapLink,
        notes: typeof excursion.notes === 'string' ? JSON.parse(excursion.notes) : excursion.notes,
      },
      gallery: [
        '/santo-domingo-hero.png',
        '/santo-domingo-1.jpeg',
        '/santo-domingo-2.jpeg',
        '/santo-domingo-3.jpeg'
      ],
      image: '/santo-domingo-hero.png',
      price: { adult: 95 },
    };
  }

  return {
    ...excursion,
    inclusions: typeof excursion.inclusions === 'string' ? JSON.parse(excursion.inclusions) : excursion.inclusions,
    practicalInfo: {
      departure: excursion.departure,
      duration: excursion.duration,
      pickup: excursion.pickup,
      pickupMapLink: excursion.pickupMapLink,
      notes: typeof excursion.notes === 'string' ? JSON.parse(excursion.notes) : excursion.notes,
    },
    gallery: typeof excursion.gallery === 'string' ? JSON.parse(excursion.gallery) : excursion.gallery,
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

  // VIRTUAL EXCURSION: Santo Domingo
  if (slug === 'santo-domingo') {
    return {
      id: 'santo-domingo',
      slug: 'santo-domingo',
      title: 'Santo Domingo City Tour',
      tagline: 'Explore the oldest city in the Americas',
      description: 'Immerse yourself in history with a visit to Santo Domingo, the first city established in the Americas. Walk through the Colonial Zone, a UNESCO World Heritage site, visit the first cathedral, the Alcázar de Colón, and the National Pantheon. This full-day cultural experience includes round-trip transportation, a delicious Dominican lunch, and a professional guide to share the rich history of the island.',
      image: '/santo-domingo-hero.png',
      icon: 'Landmark',
      price: { adult: 95 }, // Explicitly set price structure
      inclusions: [
        'Round-trip transportation',
        'Professional guide',
        'Lunch in the Colonial Zone',
        'Entrance fees to monuments',
        'Visit to First Cathedral',
        'Alcázar de Colón',
        'Calle Las Damas',
        'Free time for shopping'
      ],
      practicalInfo: {
        departure: '7:00 AM',
        duration: 'Full day (approx. 10 hours)',
        pickup: 'Hotel lobby',
        pickupMapLink: '',
        notes: [
          'Dress code: shoulders and knees covered for Cathedral',
          'Comfortable walking shoes recommended',
          'Bring camera and sunglasses',
          'Money for souvenirs',
          'Long bus ride (approx. 2.5 hours each way)'
        ]
      },
      gallery: [
        '/santo-domingo-hero.png',
        '/santo-domingo-1.jpeg',
        '/santo-domingo-2.jpeg',
        '/santo-domingo-3.jpeg'
      ]
    } as unknown as Excursion; // Cast to avoid strict type checks on missing optional fields if any
  }

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
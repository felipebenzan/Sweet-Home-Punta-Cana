"use server";

import { db } from "../lib/firebase"; // Make sure this path is correct for your 'db' instance
import { adminDb } from "../lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import type { Excursion, Room, Reservation, ServiceBooking } from "@/lib/types";

/* -------------------- 🔹 ROOMS -------------------- */
export async function getRooms(): Promise<Room[]> {
  console.log("Attempting to fetch rooms via server-actions...");
  return [];
}

export async function checkRoomAvailability({
  from,
  to,
}: {
  from: string;
  to: string;
}): Promise<string[]> {
  console.log("Checking room availability via server-actions...");
  return [];
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  console.log(`Attempting to fetch room by slug: ${slug}`);
  return null;
}

/* -------------------- 🔹 EXCURSIONS -------------------- */

export async function getExcursions(): Promise<Excursion[]> {
  try {
    const excursionsRef = collection(db, "excursions");
    const snapshot = await getDocs(excursionsRef);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Excursion[];
    return data;
  } catch (error) {
    console.error("Error fetching excursions:", error);
    return [];
  }
}

export async function getExcursionBySlug(
  slug: string
): Promise<Excursion | null> {
  try {
    const excursionsRef = collection(db, "excursions");
    const snapshot = await getDocs(excursionsRef);

    let excursion: Excursion | null = null;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.slug === slug) {
        excursion = { id: doc.id, ...data } as Excursion;
      }
    });

    if (!excursion) {
      console.warn(`⚠ No excursion found for slug: ${slug}`);
      return null;
    }

    return excursion;
  } catch (error) {
    console.error("Error fetching excursion by slug:", error);
    return null;
  }
}

export async function getExcursionById(id: string): Promise<Excursion | null> {
  try {
    console.log(`🔎 Fetching excursion by ID: ${id}`);

    const docRef = doc(db, "excursions", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn(`⚠ Excursion not found for ID: ${id}`);
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as Excursion;
  } catch (error) {
    console.error("❌ Error fetching excursion by ID:", error);
    return null;
  }
}

/* -------------------- 🔹 RESERVATIONS -------------------- */

export async function getReservations(): Promise<Reservation[]> {
  console.log("Attempting to fetch reservations via server-actions...");
  return [];
}

export async function getReservationById(
  id: string
): Promise<Reservation | null> {
  // TODO: Implement actual fetch logic for reservations, similar to getExcursionById
  console.log(`Attempting to fetch reservation by id: ${id}`);
  return null;
}

/* -------------------- 🔹 SERVICE BOOKINGS -------------------- */

export async function getServiceBookings(): Promise<ServiceBooking[]> {
  // TODO: Implement actual fetch logic for all service bookings
  console.log("Attempting to fetch service bookings via server-actions...");
  return [];
}

// **MODIFIED/IMPLEMENTED FUNCTION**
export async function getServiceBookingById(
  id: string
): Promise<ServiceBooking | null> {

try {
    console.log(`🔎 Fetching service booking by ID (Admin SDK): ${id}`);

    const docRef = adminDb.collection("serviceBookings").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.warn(`⚠ Service booking not found for ID: ${id}`);
      return null;
    }

    const data = docSnap.data();

    if (!data) { // Defensive check if .data() somehow returns undefined
        console.warn(`⚠ Service booking data is empty for ID: ${id}`);
        return null;
    }

    // --- NEW: Log the raw data here ---
    console.log("🔥 Raw Service Booking Data from Firestore (Server-side):", data);
    // You can also inspect specific fields:
    console.log("🔥 Type of data.createdAt:", typeof data.createdAt, "Value:", data.createdAt);
    if (data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt) {
        console.log("🔥 data.createdAt appears to be a Firestore Timestamp or similar object.");
    } else if (data.createdAt instanceof Date) {
        console.log("🔥 data.createdAt is a JavaScript Date object.");
    }
    // Prepare the data to be returned.
    // Initialize with all existing data, including the doc.id
    const serializedBooking: ServiceBooking = {
      id: docSnap.id,
      ...data,
      // Ensure specific fields that need serialization are handled
      // The type assertion 'as ServiceBooking' here is safe because we're
      // explicitly handling the known problematic fields or ensuring they
      // are already strings if not timestamps.
    } as ServiceBooking;

    // --- CRITICAL FIX: Serialize 'createdAt' if it's a Firestore Timestamp ---
    if (data.createdAt instanceof Timestamp) {
      serializedBooking.createdAt = data.createdAt.toDate().toISOString();
    }
    if (data.updatedAt instanceof Timestamp) {
      serializedBooking.updatedAt = data.updatedAt.toDate().toISOString();
    }
    // If 'date' or 'time' were also stored as Timestamps, you'd add similar checks:
    // if (data.date instanceof Timestamp) { serializedBooking.date = data.date.toDate().toISOString(); }
    // if (data.time instanceof Timestamp) { serializedBooking.time = data.time.toDate().toISOString(); }
    // Based on your interface, 'date' and 'time' are already string, so this
    // conversion isn't needed unless your Firestore data model differs.


    // If there are other fields that could be Firestore specific objects (like GeoPoint),
    // you would add similar conditional checks and conversions here.
    // For now, createdAt is the prime suspect.

    console.log("✅ Final Serialized Booking (Server-side, for Client):", serializedBooking);
    console.log("✅ JSON Stringified Final Serialized Booking:", JSON.stringify(serializedBooking, null, 2));
    
    return serializedBooking as ServiceBooking;
  } catch (error) {
    console.error("❌ Error fetching service booking by ID:", error);
    return null;
  }

  
}

/* -------------------- 🔹 RESERVATIONS by ROOM -------------------- */

export async function getReservationsByRoomId(
  roomId: string
): Promise<Reservation[]> {
  console.log(`Attempting to fetch reservations by room id: ${roomId}`);
  return [];
}
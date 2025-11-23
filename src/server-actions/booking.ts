'use server';

import { firestore } from "@/lib/firebase-admin";
import { collection, query, where, getDocs, Timestamp } from 'firebase-admin/firestore';

interface AvailabilityResult {
    available: boolean;
    reason?: string;
}

/**
 * Checks room availability in the reservations collection.
 * This function is designed to be called from a client-side component as a Server Action.
 *
 * @param roomId The ID of the room to check.
 * @param from The check-in date.
 * @param to The check-out date.
 * @returns An object indicating if the room is available.
 */
export async function checkRoomAvailability(
  roomId: string,
  from: Date,
  to: Date
): Promise<AvailabilityResult> {
  console.log(`Checking availability for room ${roomId} from ${from.toISOString()} to ${to.toISOString()}`);

  if (!roomId || !from || !to || from >= to) {
    // Basic validation
    return { available: false, reason: "Invalid dates provided." };
  }

  try {
    const reservationsRef = firestore.collection('reservations');

    // Convert JS Dates to Firestore Timestamps for the query
    const fromTimestamp = Timestamp.fromDate(from);
    const toTimestamp = Timestamp.fromDate(to);

    // Query for any reservations for this room that overlap with the requested dates.
    // An overlap occurs if a booking's start date is before our end date, AND that booking's end date is after our start date.
    const q = query(
        reservationsRef,
        where('roomId', '==', roomId),
        where('checkOutDate', '>', fromTimestamp), // It ends after our start
    );

    const querySnapshot = await getDocs(q);

    let isAvailable = true;
    querySnapshot.forEach(doc => {
        const reservation = doc.data();
        const checkIn = (reservation.checkInDate as Timestamp).toDate();
        // Additional check in memory since Firestore can't do two inequality filters on different fields
        if (checkIn < to) {
            isAvailable = false;
        }
    });
    
    if (isAvailable) {
        console.log("Room is available.");
        return { available: true };
    }
    else {
        console.log("Room is booked.");
        return { available: false, reason: "The room is already booked for the selected dates." };
    }

  } catch (error) {
    console.error("Error checking availability:", error);
    // It's safer to assume it's not available if an error occurs.
    return { available: false, reason: "An error occurred while checking availability." };
  }
}

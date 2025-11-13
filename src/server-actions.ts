
'use server';

import type { Excursion, Room, Reservation, ServiceBooking } from "@/lib/types";
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from "firebase-admin/firestore";
import { eachDayOfInterval, format, parseISO, isWithinInterval } from "date-fns";
import { getAccessToken } from "@/lib/paypal-oauth"; // Assuming path is correct

// This file contains all client-callable Server Actions.

// --- NEW PAYPAL SERVER ACTIONS ---

/**
 * Creates a PayPal order on the server.
 * This is the first step before the client-side PayPal buttons are rendered.
 * @param amount The total amount for the booking.
 * @param currency The currency code (e.g., "USD").
 * @returns The PayPal order ID.
 */
export async function createPaypalOrder(amount: string, currency: string): Promise<{ id: string }> {
  try {
    const { token, base } = await getAccessToken();
    console.log("Creating PayPal order with amount:", amount, "currency:", currency);

    const res = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount,
            },
            // Optional: description, custom_id, etc. to tie back to your booking
            // Example: custom_id: 'your_booking_id_here'
          },
        ],
        // Optional: application_context for redirect URLs
        // application_context: {
        //   return_url: "YOUR_SUCCESS_URL",
        //   cancel_url: "YOUR_CANCEL_URL",
        // }
      }),
    });

    const orderData = await res.json();

    if (!res.ok) {
      console.error("Failed to create PayPal order:", orderData);
      throw new Error(`Failed to create PayPal order: ${orderData.message || res.status}`);
    }

    console.log("PayPal Order created:", orderData.id);
    // return { id: orderData.id };
    return orderData.id
  } catch (error) {
    console.error("Error in createPaypalOrder:", error);
    throw error;
  }
}

/**
 * Captures the payment for a PayPal order after client-side approval.
 * @param orderId The PayPal order ID to capture.
 * @returns The PayPal capture details (e.g., transaction ID).
 */
export async function capturePaypalOrder(orderId: string): Promise<any> {
  try {
    const { token, base } = await getAccessToken();
    console.log("Capturing PayPal order:", orderId);

    const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const captureData = await res.json();

    if (!res.ok) {
      console.error("Failed to capture PayPal order:", captureData);
      throw new Error(`Failed to capture PayPal order: ${captureData.message || res.status}`);
    }

    console.log("PayPal Order captured:", captureData.id, "Status:", captureData.status);
    return captureData;
  } catch (error) {
    console.error("Error in capturePaypalOrder:", error);
    throw error;
  }
}


export async function getRooms(): Promise<Room[]> {
    const snapshot = await adminDb.collection('rooms').orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
}

export async function checkRoomAvailability({ from, to }: { from: string, to: string }): Promise<string[]> {
    const fromDate = parseISO(from);
    const toDate = parseISO(to);

    const allRooms = await getRooms();
    const availableRoomIds: string[] = [];
    const dateInterval = eachDayOfInterval({ start: fromDate, end: toDate }).slice(0, -1);
    console.log('all rooms :',allRooms)

    // Fetch all potentially relevant reservations in one go.
    const reservationsSnap = await adminDb.collection('reservations')
        .where('checkInDate', '<', to) // Bookings that start before the search range ends
        .get();

    // Filter for confirmed reservations in the code.
    const reservations = reservationsSnap.docs
        .map(doc => doc.data() as Reservation)
        .filter(res => res.status === 'Confirmed');


    // Create a map to hold the booked count for each room on each day.
    const bookingsByRoomAndDate: Record<string, Record<string, number>> = {};
    for (const res of reservations) {
        if (!res.roomId) continue;
        const resStart = parseISO(res.checkInDate);
        const resEnd = parseISO(res.checkOutDate);

        eachDayOfInterval({ start: resStart, end: new Date(resEnd.getTime() - 1) }).forEach(day => {
            // Check if this reservation's day falls within the user's search interval
            if (isWithinInterval(day, { start: fromDate, end: new Date(toDate.getTime() - 1) })) {
                 const dateKey = format(day, 'yyyy-MM-dd');
                if (!bookingsByRoomAndDate[res.roomId]) {
                    bookingsByRoomAndDate[res.roomId] = {};
                }
                if (!bookingsByRoomAndDate[res.roomId][dateKey]) {
                    bookingsByRoomAndDate[res.roomId][dateKey] = 0;
                }
                bookingsByRoomAndDate[res.roomId][dateKey]++;
            }
        });
    }

    for (const room of allRooms) {
        let isFullyAvailable = true;
        
        for (const day of dateInterval) {
            const dateKey = format(day, 'yyyy-MM-dd');
            console.log('line 153 before rateSnap',room)
            const rateSnap = await adminDb.collection(`rates/${room.id}/calendar`).doc(dateKey).get();
            console.log('after rateSnap')

            let manualInventory = room.inventoryUnits || 1;
            let isClosed = false;

            if (rateSnap.exists) {
                const rateData = rateSnap.data();
                if (rateData?.closed) {
                    isClosed = true;
                }
                manualInventory = rateData?.available ?? manualInventory;
            }

            if (isClosed) {
                isFullyAvailable = false;
                break; 
            }

            const bookedCount = bookingsByRoomAndDate[room.id]?.[dateKey] || 0;
            const netAvailable = manualInventory - bookedCount;

            if (netAvailable < 1) {
                isFullyAvailable = false;
                break;
            }
        }
        
        if (isFullyAvailable) {
            availableRoomIds.push(room.id);
        }
    }
    return availableRoomIds;
}


export async function getRoomBySlug(slug: string): Promise<Room | null> {
    const snapshot = await adminDb.collection('rooms').where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Room;
}

export async function getExcursions(): Promise<Excursion[]> {
    const snapshot = await adminDb.collection('excursions').orderBy('title').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Excursion));
}


export async function getExcursionBySlug(slug: string): Promise<Excursion | null> {
    const snapshot = await adminDb.collection('excursions').where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Excursion;
}

export async function getExcursionById(id: string): Promise<Excursion | null> {
    const doc = await adminDb.collection('excursions').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Excursion;
}

export async function getReservations(): Promise<Reservation[]> {
    const snapshot = await adminDb.collection('reservations').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
        } as Reservation;
    });
}

export async function getReservationById(id: string): Promise<Reservation | null> {
    let docSnap = await adminDb.collection('reservations').doc(id).get();

    if (!docSnap.exists) {
        return null;
    }
    
    const data = docSnap.data();
    if (!data) return null;

    const normalizedReservation: Reservation = {
        id: docSnap.id,
        guestName: data.customer.name,
        guestEmail: data.customer.email,
        checkInDate: data.dates.checkIn,
        checkOutDate: data.dates.checkOut,
        roomName: data.room.name,
        roomId: data.room.ids,
        numberOfGuests: data.guests,
        totalPrice: data.pricing.totalUSD,
        status: 'Confirmed',
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        transfer: data.transfer || null,
    };
    // console.log("Raw Reservation Data:", data);
    // console.log("Normalized Reservation:", normalizedReservation);

    return normalizedReservation;
}


export async function getServiceBookings(): Promise<ServiceBooking[]> {
    const snapshot = await adminDb
        .collection('serviceBookings')
        .orderBy('createdAt', 'desc')
        .get();

    const bookings = snapshot.docs
        .map(doc => {
            const data = doc.data();
            const safeData: { [key: string]: any } = {};
            for (const key in data) {
                const value = data[key];
                if (value instanceof Timestamp) {
                    safeData[key] = value.toDate().toISOString();
                } else if (value && typeof value === 'object' && !Array.isArray(value) && value._seconds !== undefined) { 
                    safeData[key] = new Timestamp(value._seconds, value._nanoseconds).toDate().toISOString();
                } else {
                    safeData[key] = value;
                }
            }
            return { id: doc.id, ...safeData } as ServiceBooking;
        });

    return bookings;
}

export async function getServiceBookingById(id: string): Promise<ServiceBooking | null> {
    const doc = await adminDb.collection('serviceBookings').doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    const safeData: { [key: string]: any } = {};
    for (const key in data) {
        const value = data[key];
        if (value instanceof Timestamp) {
            safeData[key] = value.toDate().toISOString();
        } else if (value && typeof value === 'object' && value._seconds !== undefined) {
            safeData[key] = new Timestamp(value._seconds, value._nanoseconds).toDate().toISOString();
        } else {
            safeData[key] = value;
        }
    }
    // console.log("safe data :",safeData)
     return {
        id: doc.id,
        ...safeData,
    } as ServiceBooking;
}

export async function getReservationsByRoomId(roomId: string): Promise<Reservation[]> {
    const snapshot = await adminDb.collection('reservations').where('roomId', '==', roomId).get();
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
        } as Reservation;
    });
}

export async function saveRoom(roomData: Partial<Room>): Promise<{id: string}> {
    if (roomData.id) {
        console.log('save rooms funtion room data id:',roomData.id)
        const { id, ...dataToUpdate } = roomData;
        console.log('after save rooms funtion room data id:',{ id })
        await adminDb.collection('rooms').doc(id).set(dataToUpdate, { merge: true });
        return { id };
    } else {
        const docRef = await adminDb.collection('rooms').add(roomData);
        await docRef.update({ id: docRef.id });
        console.log('save rooms funtion docRef id:',docRef.id)
        return { id: docRef.id };
    }
}

export async function saveExcursion(excursionData: Partial<Excursion>): Promise<{id: string}> {
    if (excursionData.id) {
        const { id, ...dataToUpdate } = excursionData;
        await adminDb.collection('excursions').doc(id).set(dataToUpdate, { merge: true });
        return { id };
    } else {
        const docRef = await adminDb.collection('excursions').add(excursionData);
        return { id: docRef.id };
    }
}

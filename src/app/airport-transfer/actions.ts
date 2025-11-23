
'use server';

import { adminFirestore } from '@/firebase/server'; // Corrected import
import { Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

interface CreateTransferBookingArgs {
    customer: { name: string; email: string; phone: string; };
    pricing: { totalUSD: number; currency: string; };
    details: {
        direction: 'arrive' | 'depart' | 'round';
        arrivalDate: string | null;
        departureDate: string | null;
        arrivalFlight: string | null; // Allow null
        departureFlight: string | null; // Allow null
        departureTime: string | null;
    };
    paypalOrderId: string;
    paypalTransactionId: string;
    guestUid: string | null;
}

export async function createTransferBooking(args: CreateTransferBookingArgs) {
    try {
        const {
            customer,
            pricing,
            details,
            paypalOrderId,
            paypalTransactionId,
            guestUid
        } = args;

        // Use the correctly imported adminFirestore object
        const bookingRef = adminFirestore.collection('serviceBookings').doc(paypalTransactionId);

        await bookingRef.set({
            type: 'airportTransfer',
            status: 'CONFIRMED',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            customer,
            pricing,
            details,
            paypalOrderId,
            paypalTransactionId,
            guestUid,
        });

        const bookingId = bookingRef.id;
        console.log(`Successfully created booking ${bookingId}`);

        revalidatePath('/admin/guest-services');

        return { success: true, bookingId };

    } catch (error) {
        console.error("Error creating transfer booking:", error);
        return { success: false, error: 'Failed to create booking in database.' };
    }
}

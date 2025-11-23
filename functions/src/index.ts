
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

admin.initializeApp();

const db = admin.firestore();

// V2 Functions
export const createBookingDraftV2 = functions.https.onCall(async (data, context) => {
    try {
        const { bookingKind, guestInfo, serviceType, serviceDetails } = data;

        if (!bookingKind || !guestInfo || !serviceType) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing required booking information.');
        }

        const docRef = await db.collection('serviceBookings').add({
            status: 'Draft',
            createdAt: Timestamp.now(),
            bookingKind,
            guestInfo,
            serviceType,
            serviceDetails: serviceDetails || null,
        });

        return { ok: true, bookingId: docRef.id };

    } catch (error) {
        console.error("Error creating booking draft:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Could not create booking draft.', { errorMessage: (error as Error).message, errorStack: (error as Error).stack });
    }
});

export const capturePayment = functions.https.onCall(async (data, context) => {
    try {
        const { bookingId, bookingKind, paypalOrderId } = data;

        if (!bookingId || !bookingKind || !paypalOrderId) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing required payment information.');
        }

        let collectionName = '';
        if (bookingKind === 'service') {
            collectionName = 'serviceBookings';
        } else if (bookingKind === 'reservation') {
            collectionName = 'reservations';
        } else {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid booking kind.');
        }

        await db.collection(collectionName).doc(bookingId).update({
            status: 'Confirmed',
            paypalOrderId: paypalOrderId,
            paymentAt: Timestamp.now(),
        });

        return { ok: true, message: "Payment captured successfully." };

    } catch (error) {
        console.error("Error capturing payment:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Could not capture payment.', { errorMessage: (error as Error).message, errorStack: (error as Error).stack });
    }
});

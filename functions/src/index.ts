
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// DEBUG VERSION - Returns full error stack
export const createBookingDraft = functions.https.onCall(async (data, context) => {
  console.log("[createBookingDraft] RAW INPUT:", JSON.stringify(data));

  try {
    // 1. basic validation
    if (!data || !data.bookingKind) {
      console.error("[createBookingDraft] MISSING bookingKind");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "bookingKind is required ('room' or 'service')."
      );
    }

    if (!data.guestInfo || !data.guestInfo.fullName || !data.guestInfo.email) {
      console.error("[createBookingDraft] MISSING guestInfo fields:", data.guestInfo);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "guestInfo.fullName and guestInfo.email are required."
      );
    }

    // 2. compute pricing
    const pricing = computePricing(data);
    console.log("[createBookingDraft] PRICING:", pricing);

    // 3. branch: service
    if (data.bookingKind === "service") {
      if (!data.serviceType) {
        console.error("[createBookingDraft] MISSING serviceType");
        throw new functions.https.HttpsError(
          "invalid-argument",
          "serviceType is required for service bookings."
        );
      }

      const docData = buildServiceBookingDoc(data, pricing);
      console.log("[createBookingDraft] DOC TO WRITE (service):", docData);

      const ref = await db.collection("serviceBookings").add(docData);
      console.log("[createBookingDraft] WRITE OK. ID:", ref.id);

      return {
        bookingId: ref.id,
        totalDue: pricing.totalDue,
        currency: "USD",
      };
    }

    // 4. branch: room
    if (data.bookingKind === "room") {
      if (!data.roomId || !data.checkIn || !data.checkOut) {
        console.error("[createBookingDraft] MISSING room fields:", {
          roomId: data.roomId,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
        });
        throw new functions.https.HttpsError(
          "invalid-argument",
          "roomId, checkIn, and checkOut are required for room bookings."
        );
      }

      const docData = buildRoomBookingDoc(data, pricing);
      console.log("[createBookingDraft] DOC TO WRITE (room):", docData);

      const ref = await db.collection("roomBookings").add(docData);
      console.log("[createBookingDraft] WRITE OK. ID:", ref.id);

      return {
        bookingId: ref.id,
        totalDue: pricing.totalDue,
        currency: "USD",
      };
    }

    console.error("[createBookingDraft] INVALID bookingKind VALUE:", data.bookingKind);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "bookingKind must be 'room' or 'service'."
    );

  } catch (err: any) {
    console.error("[createBookingDraft] ERROR CAUGHT:", err);
    // Return the full error details to the client to expose the real problem.
    throw new functions.https.HttpsError(
        "internal",
        `Function failed. Raw Error: ${err.message}. Stack: ${err.stack}`
    );
  }
});

// 2. capturePayment
// Frontend calls this AFTER PayPal onApprove.
// You pass { bookingId, bookingKind, paypalOrderId }
// Server will verify with PayPal, then mark booking paid.
export const capturePayment = functions.https.onCall(async (data, context) => {
  const { bookingId, bookingKind, paypalOrderId } = data || {};
  if (!bookingId || !bookingKind || !paypalOrderId) {
    throw new functions.https.HttpsError("invalid-argument", "bookingId, bookingKind, paypalOrderId are required.");
  }

  // TODO: call PayPal REST API with your client/secret (server-side) and verify capture
  // For now we assume PayPal said "OK"
  const paypalCaptureId = "FAKE_CAPTURE_ID";

  const colName = bookingKind === "room" ? "roomBookings" : "serviceBookings";
  const ref = db.collection(colName).doc(bookingId);

  await ref.update({
    status: "confirmed",
    "payment.paid": true,
    "payment.paypalOrderId": paypalOrderId,
    "payment.paypalCaptureId": paypalCaptureId,
    "payment.paidAt": admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { ok: true };
});

// inline util: compute simple pricing so nothing crashes
function computePricing(data: any) {
  if (data.bookingKind === "service" && (data.serviceType === "laundry" || data.serviceType === "laundry-service-wash-dry")) {
    const bags = data.serviceDetails?.bagsOrLoadCount || 1;
    const subtotal = 5 * bags;
    const taxes = 0;
    const totalDue = subtotal + taxes;
    return { subtotal, taxes, totalDue };
  }

  const subtotal = 5;
  const taxes = 0;
  const totalDue = subtotal + taxes;
  return { subtotal, taxes, totalDue };
}

// inline util: build Firestore doc for service booking
function buildServiceBookingDoc(data: any, pricing: any) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  return {
    type: data.serviceType,
    guestUid: data.guestUid || null,
    guestInfo: {
      fullName: data.guestInfo?.fullName || "",
      email: data.guestInfo?.email || "",
      phone: data.guestInfo?.phone || "",
    },
    details: data.serviceDetails || {},
    pricing: {
      subtotal: pricing.subtotal,
      taxes: pricing.taxes,
      totalDue: pricing.totalDue,
    },
    status: "awaiting_payment",
    payment: {
      paid: false,
      processor: "paypal",
      paypalOrderId: "",
      paypalCaptureId: "",
      currency: "USD",
      paidAt: null,
    },
    createdAt: now,
    updatedAt: now,
  };
}

// inline util: build Firestore doc for room booking
function buildRoomBookingDoc(data: any, pricing: any) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  return {
    roomId: data.roomId || "",
    guestUid: data.guestUid || null,
    guestInfo: {
      fullName: data.guestInfo?.fullName || "",
      email: data.guestInfo?.email || "",
      phone: data.guestInfo?.phone || "",
    },
    stay: {
      checkIn: data.checkIn || "",
      checkOut: data.checkOut || "",
      nights: 1,
    },
    pricing: {
      nightlyRate: pricing.subtotal,
      subtotal: pricing.subtotal,
      taxes: pricing.taxes,
      totalDue: pricing.totalDue,
    },
    status: "awaiting_payment",
    payment: {
      paid: false,
      processor: "paypal",
      paypalOrderId: "",
      paypalCaptureId: "",
      currency: "USD",
      paidAt: null,
    },
    createdAt: now,
    updatedAt: now,
  };
}


export const createBookingDraftV2 = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    console.log("[createBookingDraftV2] INPUT:", JSON.stringify(data));

    try {
      // no validation drama for now, just write something
      const pricing = computePricing(data);
      const docData = buildServiceBookingDoc(data, pricing);

      console.log("[createBookingDraftV2] TRYING WRITE:", docData);

      const ref = await db.collection("serviceBookings").add(docData);

      console.log("[createBookingDraftV2] WRITE OK:", ref.id);

      return {
        ok: true,
        source: "V2",
        bookingId: ref.id,
        totalDue: pricing.totalDue ?? null,
        currency: "USD",
      };
    } catch (err: any) {
      console.error("[createBookingDraftV2] ERROR:", err);

      return {
        ok: false,
        source: "V2",
        errorName: err?.name || null,
        errorMessage: err?.message || null,
        errorStack: err?.stack || null,
      };
    }
  });


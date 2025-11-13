
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

function computePricing(data: any) {
  if (data.bookingKind === "service" && data.serviceType === "laundry") {
    const bags = data?.serviceDetails?.bagsOrLoadCount || 1;
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

export const createBookingDraft = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    console.log("[createBookingDraft] INPUT:", JSON.stringify(data));

    try {
      // validation
      if (!data || !data.bookingKind) {
        console.error("[createBookingDraft] missing bookingKind");
        return {
          ok: false,
          step: "validation",
          errorMessage: "bookingKind is required ('room' or 'service').",
        };
      }

      if (!data.guestInfo || !data.guestInfo.fullName || !data.guestInfo.email) {
        console.error("[createBookingDraft] missing guestInfo", data.guestInfo);
        return {
          ok: false,
          step: "validation",
          errorMessage: "guestInfo.fullName and guestInfo.email are required.",
        };
      }

      const pricing = computePricing(data);
      console.log("[createBookingDraft] PRICING:", pricing);

      if (data.bookingKind === "service") {
        if (!data.serviceType) {
          console.error("[createBookingDraft] missing serviceType");
          return {
            ok: false,
            step: "validation",
            errorMessage: "serviceType is required for service bookings.",
          };
        }

        const docData = buildServiceBookingDoc(data, pricing);
        console.log("[createBookingDraft] WRITING serviceBookings doc:", docData);

        const ref = await db.collection("serviceBookings").add(docData);
        console.log("[createBookingDraft] WRITE OK. bookingId:", ref.id);

        return {
          ok: true,
          bookingId: ref.id,
          totalDue: pricing.totalDue,
          currency: "USD",
        };
      }

      if (data.bookingKind === "room") {
        if (!data.roomId || !data.checkIn || !data.checkOut) {
          console.error("[createBookingDraft] missing room data", {
            roomId: data.roomId,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
          });
          return {
            ok: false,
            step: "validation",
            errorMessage: "roomId, checkIn, and checkOut are required for room bookings.",
          };
        }

        const docData = buildRoomBookingDoc(data, pricing);
        console.log("[createBookingDraft] WRITING roomBookings doc:", docData);

        const ref = await db.collection("roomBookings").add(docData);
        console.log("[createBookingDraft] WRITE OK. bookingId:", ref.id);

        return {
          ok: true,
          bookingId: ref.id,
          totalDue: pricing.totalDue,
          currency: "USD",
        };
      }

      console.error("[createBookingDraft] invalid bookingKind:", data.bookingKind);
      return {
        ok: false,
        step: "validation",
        errorMessage: "bookingKind must be 'room' or 'service'.",
      };

    } catch (err: any) {
      console.error("[createBookingDraft] CATCH BLOCK ERROR:", err);
      return {
        ok: false,
        step: "catch",
        errorName: err?.name || null,
        errorMessage: err?.message || null,
        errorStack: err?.stack || null,
      };
    }
  });

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

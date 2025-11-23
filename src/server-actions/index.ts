'use server';

import { db } from "@/lib/firebase/server";
import { auth } from "firebase-admin";
import paypal from '@paypal/checkout-server-sdk';
import { PurchaseContext } from "@/components/PayPalButtonsWrapper"; // Import the shared type

// --- 1. FIRESTORE DATA MODELS (as interfaces) ---

interface ServiceDoc {
    id: string;
    name: string;
    type: 'room' | 'transfer' | 'laundry' | 'excursion';
    pricingModel: 'per_night' | 'fixed' | 'per_bag' | 'per_person';
    basePrice: number;
    currency: string;
    isActive: boolean;
}

interface CartDoc {
    userId: string;
    status: 'DRAFT' | 'PENDING_PAYMENT' | 'COMPLETED' | 'FAILED';
    lineItems: Array<{ serviceId: string; quantity: number; [key: string]: any; }>;
    paymentId?: string;
}

interface BookingDoc {
    customer: { name: string; email: string; phone: string; };
    pricing: { totalUSD: number; currency: string; };
    details: { direction: string; };
}

// --- 2. PAYPAL CLIENT SETUP ---

function getPayPalClient() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET;

    if (!clientId || !clientSecret) {
        console.error("CRITICAL SERVER ERROR: PayPal credentials are not defined.");
        throw new Error("Server is missing PayPal configuration.");
    }

    const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    return new paypal.core.PayPalHttpClient(environment);
}


// --- 3. CORE SERVER ACTIONS ---

export async function createPaypalOrder(purchaseContext: PurchaseContext) {
    try {
        console.log("Server creating PayPal order for context:", purchaseContext);

        const { amount, currency, items } = await calculateTotalFromContext(purchaseContext);

        if (parseFloat(amount) <= 0) {
            throw new Error("Order total must be positive.");
        }

        const paypalClient = getPayPalClient();
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: currency,
                    value: amount,
                },
            }],
        });

        const order = await paypalClient.execute(request);
        const paypalOrderId = order.result.id;

        const paymentRef = db.collection('payments').doc();
        await paymentRef.set({
            paypalOrderId: paypalOrderId,
            amount: { value: parseFloat(amount), currency: currency },
            status: 'CREATED',
            context: purchaseContext,
            items: items,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Link the payment doc to the source collection (cart or booking)
        const sourceCollection = purchaseContext.type === 'cart' ? 'carts' : 'serviceBookings';
        const sourceRef = db.collection(sourceCollection).doc(purchaseContext.referenceId);
        await sourceRef.update({
            paymentId: paymentRef.id,
            status: 'PENDING_PAYMENT'
        });

        return order.result;

    } catch (error: any) {
        console.error("!!! FATAL: FAILED TO CREATE PAYPAL ORDER ON SERVER !!!", { message: error.message, context: purchaseContext });
        throw new Error(`Server Error: ${error.message}`);
    }
}

export async function capturePaypalOrder(paypalOrderId: string) {
    try {
        const paymentQuery = await db.collection('payments').where('paypalOrderId', '==', paypalOrderId).limit(1).get();
        if (paymentQuery.empty) {
            throw new Error("Payment record not found in Firestore.");
        }

        const paymentDoc = paymentQuery.docs[0];
        const paymentData = paymentDoc.data();

        if (paymentData.status === 'COMPLETED') {
            return { ok: true, data: { status: 'COMPLETED' } }; // Idempotency
        }

        const paypalClient = getPayPalClient();
        const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
        request.requestBody({});

        const capture = await paypalClient.execute(request);
        const captureResult = capture.result;

        if (captureResult.status !== 'COMPLETED') {
            throw new Error(`PayPal capture failed with status: ${captureResult.status}`);
        }

        await db.runTransaction(async (transaction) => {
            transaction.update(paymentDoc.ref, { 
                status: 'COMPLETED', 
                paypalRaw: captureResult,
                updatedAt: new Date()
            });

            if (paymentData.context && paymentData.context.referenceId) {
                const { type, referenceId } = paymentData.context;
                const sourceCollection = type === 'cart' ? 'carts' : 'serviceBookings';
                const sourceRef = db.collection(sourceCollection).doc(referenceId);
                const finalStatus = type === 'cart' ? 'COMPLETED' : 'CONFIRMED';
                transaction.update(sourceRef, { status: finalStatus, updatedAt: new Date() });
            }
        });

        console.log("Successfully captured payment and updated Firestore.");
        return { ok: true, data: captureResult };

    } catch (error: any) {
        console.error("--- FATAL ERROR IN CAPTURE ORDER ---", { message: error.message, paypalOrderId });
        return { ok: false, error: error.message || "Failed to capture payment on server." };
    }
}


// --- 4. HELPER FUNCTION for Secure Price Calculation ---

async function calculateTotalFromContext(context: PurchaseContext): Promise<{ amount: string, currency: string, items: any[] }> {
    let total = 0;
    let currency = 'USD';
    let items: any[] = [];

    switch (context.type) {
        case 'cart':
            const cartRef = db.collection('carts').doc(context.referenceId);
            const cartDoc = await cartRef.get();
            if (!cartDoc.exists) throw new Error(`Cart with ID ${context.referenceId} not found.`);
            
            const cartData = cartDoc.data() as CartDoc;
            
            for (const item of cartData.lineItems) {
                const serviceRef = db.collection('services').doc(item.serviceId);
                const serviceDoc = await serviceRef.get();
                if (!serviceDoc.exists) throw new Error(`Service with ID ${item.serviceId} not found.`);
                
                const serviceData = serviceDoc.data() as ServiceDoc;
                total += serviceData.basePrice * item.quantity;
                currency = serviceData.currency;
                items.push({ id: item.serviceId, name: serviceData.name, quantity: item.quantity, price: serviceData.basePrice });
            }
            break;

        case 'airportTransfer':
            const bookingRef = db.collection('serviceBookings').doc(context.referenceId);
            const bookingDoc = await bookingRef.get();
            if (!bookingDoc.exists) throw new Error(`Booking with ID ${context.referenceId} not found.`);

            const bookingData = bookingDoc.data() as BookingDoc;
            total = bookingData.pricing.totalUSD;
            currency = bookingData.pricing.currency;
            items.push({ 
                id: context.referenceId, 
                name: `Airport Transfer: ${bookingData.details.direction}`,
                quantity: 1, 
                price: bookingData.pricing.totalUSD 
            });
            break;

        default:
            // This will catch 'booking', 'laundry', etc. if they are not explicitly handled
            throw new Error(`Unsupported purchase context type: '${(context as any).type}'`);
    }

    if (total <= 0) {
        throw new Error("Calculated total must be a positive number.");
    }

    return { amount: total.toFixed(2), currency, items };
}

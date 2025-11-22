
'use server';

import { getAccessToken } from "@/lib/paypal-oauth";

// --- PAYPAL SERVER ACTIONS ---

/**
 * Creates a PayPal order on the server.
 * @param amount The total amount for the booking.
 * @param currency The currency code (e.g., "USD").
 * @returns The PayPal order ID as a string.
 */
export async function createPaypalOrder(amount: string, currency: string): Promise<string> {
  try {
    const { token, base } = await getAccessToken();
    console.log("Creating PayPal order with amount:", amount, "currency:", currency);

    const res = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount,
            },
          },
        ],
      }),
    });

    const orderData = await res.json();

    if (!res.ok) {
      console.error("Failed to create PayPal order:", orderData);
      throw new Error(`Failed to create PayPal order: ${orderData.message || res.status}`);
    }

    console.log("PayPal Order created:", orderData.id);
    return orderData.id;
  } catch (error) {
    console.error("Error in createPaypalOrder:", error);
    throw error;
  }
}

/**
 * Captures the payment for a PayPal order after client-side approval.
 * @param orderId The PayPal order ID to capture.
 * @returns The PayPal transaction ID as a string.
 */
export async function capturePaypalOrder(orderId: string): Promise<string> {
  try {
    const { token, base } = await getAccessToken();
    console.log("Capturing PayPal order:", orderId);

    const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    });

    const captureData = await res.json();
    console.log("Full PayPal capture response:", JSON.stringify(captureData, null, 2));

    if (!res.ok) {
      console.error("Failed to capture PayPal order:", captureData);
      throw new Error(`Failed to capture PayPal order: ${captureData.message || res.status}`);
    }

    const transactionId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    if (!transactionId) {
      console.error("Could not find transaction ID in PayPal capture response:", captureData);
      throw new Error("Could not extract transaction ID from PayPal response.");
    }

    console.log("PayPal Order captured. Transaction ID:", transactionId);
    return transactionId;
  } catch (error) {
    console.error("Error in capturePaypalOrder:", error);
    throw error;
  }
}

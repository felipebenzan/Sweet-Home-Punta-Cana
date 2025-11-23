'use server';

import { getPayPalAccessToken } from '@/lib/paypal';

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE;
if (!PAYPAL_API_BASE) {
  throw new Error('Missing PAYPAL_API_BASE environment variable');
}

/**
 * Crea una orden de PayPal en el servidor.
 * @param amount Importe total (ej. "35.00").
 * @param currency Código de moneda (ej. "USD").
 */
export async function createPaypalOrder(
  amount: string,
  currency: string
): Promise<string> {
  try {
    const token = await getPayPalAccessToken();
    console.log('Creating PayPal order with amount:', amount, 'currency:', currency);

    const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
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
      console.error('Failed to create PayPal order:', orderData);
      throw new Error(
        `Failed to create PayPal order: ${orderData.message || res.status}`
      );
    }

    console.log('PayPal Order created:', orderData.id);
    return orderData.id;
  } catch (error) {
    console.error('Error in createPaypalOrder:', error);
    throw error;
  }
}

/**
 * Captura el pago de una orden de PayPal.
 * @param orderId ID de la orden de PayPal.
 */
export async function capturePaypalOrder(orderId: string): Promise<string> {
  try {
    const token = await getPayPalAccessToken();
    console.log('Capturing PayPal order:', orderId);

    const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const captureData = await res.json();
    console.log('Full PayPal capture response:', JSON.stringify(captureData, null, 2));

    if (!res.ok) {
      console.error('Failed to capture PayPal order:', captureData);
      throw new Error(
        `Failed to capture PayPal order: ${captureData.message || res.status}`
      );
    }

    const transactionId =
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    if (!transactionId) {
      console.error(
        'Could not find transaction ID in PayPal capture response:',
        captureData
      );
      throw new Error('Could not extract transaction ID from PayPal response.');
    }

    console.log('PayPal Order captured. Transaction ID:', transactionId);
    return transactionId;
  } catch (error) {
    console.error('Error in capturePaypalOrder:', error);
    throw error;
  }
}

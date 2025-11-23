// src/lib/paypal.ts
'use server';

/**
 * Genera un access token de PayPal para llamadas servidor-servidor.
 * Usa PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET y PAYPAL_API_BASE.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      'CRITICAL: Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET environment variables.'
    );
    throw new Error('MISSING_PAYPAL_CREDENTIALS');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch(`${process.env.PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('PayPal Auth Error:', response.status, errorBody);
      throw new Error('Failed to get PayPal access token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('getPayPalAccessToken failed:', error);
    throw new Error('Failed to communicate with the PayPal API.');
  }
}
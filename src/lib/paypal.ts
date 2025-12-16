// src/lib/paypal.ts
'use server';

/**
 * Genera un access token de PayPal para llamadas servidor-servidor.
 * Usa PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET y PAYPAL_API_BASE.
 */
export async function getPayPalAccessToken(): Promise<string> {
  // EMERGENCY BYPASS: Vercel env vars are stuck. Using direct keys.
  // EMERGENCY BYPASS: Vercel env vars are stuck. Using direct keys.
  const HARDCODED_CLIENT_ID = "ATj0R0crY6MxnyYdsbpSAnUh5_8Ih5r6A0zUDRA1rSuLedlDGEwg_P7JuXI5QNY4jKpXZdc_Guk0vL9e";
  const HARDCODED_SECRET = "EEYBwxbakfP9C3bS8pqWAf-T1ltJiviQOSJ8j8uS12lX7mvzm0Dt8ZLiAMcRw9DtlB52dsSdxch0pvJZ";

  const clientId = HARDCODED_CLIENT_ID;
  const clientSecret = HARDCODED_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      'CRITICAL: Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET environment variables.'
    );
    throw new Error('MISSING_PAYPAL_CREDENTIALS');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  // Force Live URL
  const apiBase = "https://api-m.paypal.com";

  try {
    const response = await fetch(`${apiBase}/v1/oauth2/token`, {
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
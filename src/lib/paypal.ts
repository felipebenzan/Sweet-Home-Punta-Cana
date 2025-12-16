// src/lib/paypal.ts
'use server';

/**
 * Genera un access token de PayPal para llamadas servidor-servidor.
 * Usa PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET y PAYPAL_API_BASE.
 */
export async function getPayPalAccessToken(): Promise<string> {
  // RUNTIME INJECTION: Read directly from server environment
  const clientId = process.env.PAYPAL_LIVE_ID_RUNTIME || process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_LIVE_SECRET_RUNTIME || process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      // Build-time silence: don't crash, just log warning
      console.warn('WARN: PayPal credentials missing during build/server init.');
      return ''; // Return empty string to prevent build crash
    }
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
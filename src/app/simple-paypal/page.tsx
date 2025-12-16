import SimplePayPalClient from "./client-page";

export const dynamic = 'force-dynamic';

export default function SimplePayPalPage() {
    // RUNTIME INJECTION
    const clientId = process.env.PAYPAL_LIVE_ID_RUNTIME || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

    return <SimplePayPalClient clientId={clientId} />;
}

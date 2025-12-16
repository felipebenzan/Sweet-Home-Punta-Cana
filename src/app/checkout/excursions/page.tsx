import ExcursionCheckoutClient from "./client-page";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Secure Checkout | Sweet Home Punta Cana',
    description: 'Complete your booking securely.',
};

export const dynamic = 'force-dynamic';

export default function ExcursionCheckoutPage() {
    // RUNTIME INJECTION
    const googleMapsApiKey = process.env.GOOGLE_MAPS_KEY_RUNTIME || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    return (
        <ExcursionCheckoutClient googleMapsApiKey={googleMapsApiKey} />
    );
}

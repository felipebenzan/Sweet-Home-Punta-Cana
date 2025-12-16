import ConfirmationClient from "./client-page";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Booking Confirmed | Sweet Home Punta Cana',
    description: 'Your booking has been confirmed.',
};

export const dynamic = 'force-dynamic';

export default function ConfirmationPage() {
    // RUNTIME INJECTION
    const googleMapsApiKey = process.env.GOOGLE_MAPS_KEY_RUNTIME || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    return (
        <ConfirmationClient googleMapsApiKey={googleMapsApiKey} />
    );
}

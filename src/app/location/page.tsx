import FindUsClient from "./find-us-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Find Us | Sweet Home Punta Cana',
    description: 'Easy directions to Sweet Home Punta Cana. Whether by car, taxi, public transport, or Uber, we simplify your arrival to paradise.',
};

export const dynamic = 'force-dynamic';

export default function FindUsPage() {
    // RUNTIME INJECTION: Read key from server environment
    const googleMapsApiKey = process.env.GOOGLE_MAPS_KEY_RUNTIME || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    return (
        <FindUsClient googleMapsApiKey={googleMapsApiKey} />
    );
}

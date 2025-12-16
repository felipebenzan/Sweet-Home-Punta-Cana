import MiniMarketDeliveryClient from "./client-page";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mini Market Delivery | Sweet Home Punta Cana',
    description: 'Everything you need, delivered fast. Mini Market (Colmado) services.',
};

export const dynamic = 'force-dynamic';

export default function MiniMarketDeliveryPage() {
    // RUNTIME INJECTION: Read key from server environment
    const googleMapsApiKey = process.env.GOOGLE_MAPS_KEY_RUNTIME || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    return (
        <MiniMarketDeliveryClient googleMapsApiKey={googleMapsApiKey} />
    );
}

import ExcursionConfirmationClient from "./client-page";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Excursion Confirmed | Sweet Home Punta Cana',
    description: 'Your excursion booking has been confirmed.',
};

export default function ExcursionConfirmationPage() {
    return <ExcursionConfirmationClient />;
}

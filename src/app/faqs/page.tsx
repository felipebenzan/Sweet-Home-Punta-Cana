import type { Metadata } from 'next';
import FaqsClient from './faqs-client';

export const metadata: Metadata = {
  title: 'Punta Cana Travel FAQs (150+ Q&As) - Sweet Home Punta Cana',
  description:
    'The ultimate FAQ guide for Punta Cana. Answers to 150+ questions about budget, safety, beach access, airport transfers, excursions, and staying at our adults-only guest house.',
};

export default function FaqsPage() {
  // This is now a Server Component.
  // It fetches no data but handles metadata and renders the client component.
  return <FaqsClient />;
}

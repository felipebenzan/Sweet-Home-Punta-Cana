
import type { Metadata } from 'next';
import RulesClient from './rules-client';

export const metadata: Metadata = {
  title: 'House Rules & Restrictions - Sweet Home Punta Cana',
  description: 'Read the official house rules and property restrictions for a safe, respectful, and enjoyable stay at our adults-only guest house in Punta Cana.',
};

export default function RulesPage() {
  // This is now a Server Component that renders the Client Component.
  return <RulesClient />;
}

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface BookNowButtonProps {
  slug: string;
}

export default function BookNowButton({ slug }: BookNowButtonProps) {
  const router = useRouter();

  const handleBookNow = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const from = tomorrow.toISOString().split('T')[0];
    const to = dayAfter.toISOString().split('T')[0];

    router.push(`/search?from=${from}&to=${to}&guests=2&room=${slug}`);
  };

  return (
    <Button onClick={handleBookNow} className="rounded-full">
      Book Now <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}

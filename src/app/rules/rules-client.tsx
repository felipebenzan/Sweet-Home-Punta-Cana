
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState, useEffect } from 'react';

export default function RulesClient() {
  const [lastUpdatedDate, setLastUpdatedDate] = useState('');

  useEffect(() => {
    // This code now runs only on the client, after the initial render
    setLastUpdatedDate(new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));
  }, []); // The empty dependency array ensures this runs only once

  return (
    <div className="bg-shpc-sand py-12 sm:py-16 pt-[calc(var(--header-height)+3rem)]">
      <div className="max-w-3xl mx-auto px-6">
        <Card className="shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl">Rules & Restrictions</CardTitle>
            {lastUpdatedDate ? (
              <p className="text-sm text-muted-foreground">Last updated: {lastUpdatedDate}</p>
            ) : (
              // Show a placeholder while the client is rendering to prevent layout shift
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mt-1"></div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              When booking and staying at Sweet Home Punta Cana, guests agree to follow the following rules and restrictions:
            </p>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">1. Reservations & Payments</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Reservations are confirmed only after payment is received.</li>
                <li>A valid government-issued ID (passport or national ID) must be presented at check-in.</li>
                <li>The number of guests per room must not exceed the maximum occupancy listed at the time of booking.</li>
                <li>Guests must be 18 years or older. No minors are allowed.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">2. Check-In & Check-Out</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Check-in time: 3:00 PM</li>
                <li>Check-out time: 11:00 AM</li>
                <li>Early check-in or late check-out may be available upon request and subject to additional fees.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">3. House Rules</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>No smoking inside the property. Designated outdoor smoking areas may be provided.</li>
                <li>Pets are not allowed unless explicitly approved in writing before arrival.</li>
                <li>Parties, loud music, or events are not permitted without prior approval.</li>
                <li>Guests are expected to respect other residents in the residential complex.</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">4. Property Care & Damages</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Guests are responsible for maintaining the property in good condition during their stay.</li>
                <li>Any damage, missing items, or excessive cleaning required after check-out may result in additional charges.</li>
                <li>Makeup or personal care products must not be used on white towels or linens. Makeup towels are provided for this purpose.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">5. Security & Liability</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Guests are responsible for their personal belongings. Sweet Home Punta Cana is not liable for lost or stolen items.</li>
                <li>For safety reasons, only registered guests are allowed on the property. Visitors must be approved in advance.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">6. Cancellations & Refunds</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-semibold text-foreground">Reservations under USD $100:</span> Cancellations made 72 hours or more before check-in will receive a full refund.</li>
                <li><span className="font-semibold text-foreground">Reservations over USD $100:</span> Cancellations must be made at least 7 days before check-in to qualify for a refund.</li>
                <li>Cancellations made after these deadlines, same-day cancellations, or no-shows are non-refundable.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">7. Compliance with Law</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Guests must comply with all Dominican Republic laws, including residency registration requirements.</li>
                <li>Any illegal activity is strictly prohibited and will result in immediate cancellation of the stay without refund.</li>
              </ul>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}

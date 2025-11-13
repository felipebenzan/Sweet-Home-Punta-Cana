
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Excursion Terms of Service - Sweet Home Punta Cana',
  description: 'Read the terms and conditions for booking excursions and tours through Sweet Home Punta Cana, including policies on payment, cancellation, and liability.',
};

export default function ExcursionTermsPage() {
  const lastUpdatedDate = 'September 17, 2025';

  return (
    <div className="bg-shpc-sand py-12 sm:py-16 pt-[calc(var(--header-height)+3rem)]">
      <div className="max-w-3xl mx-auto px-6">
        <Card className="shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service – Excursions</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdatedDate}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              These Terms of Service (“Terms”) govern the booking of excursions and activities (“Excursions”) made through Sweet Home Punta Cana (“we,” “our,” “us”). By booking an Excursion through our website or in person, you (“guest,” “you”) agree to these Terms.
            </p>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">1. Contractual Relationship</h3>
              <p className="text-muted-foreground">
                Sweet Home Punta Cana acts solely as an intermediary between you and the third-party excursion provider (“Provider”). We collect payment and confirm reservations on your behalf. The Provider is solely responsible for delivering the excursion experience, including safety, transportation, and service quality. By booking, you enter into a contractual relationship with both us (as the booking agent) and the Provider (as the service operator).
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">2. Reservations & Payments</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Reservations are confirmed only after full payment has been received.</li>
                <li>All prices are displayed in U.S. Dollars (USD), unless stated otherwise.</li>
                <li>You are responsible for any credit card or bank processing fees.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">3. Pickup & Guest Responsibilities</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Pickup times are scheduled and must be respected. Guests who are not ready at the agreed pickup location on time may be considered a no-show.</li>
                  <li>Rescheduling may be possible, depending on Provider availability, but is not guaranteed.</li>
                  <li>Guests are responsible for their own conduct during the excursion and must comply with all instructions from the Provider.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">4. Cancellations & Refunds</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>All excursion sales are final. No refunds will be issued for cancellations, same-day cancellations, or no-shows.</li>
                <li>Rescheduling, if offered, is at the sole discretion of the Provider.</li>
                <li>We do not guarantee any refund or compensation for changes beyond our control (e.g., weather, Provider delays, or government restrictions).</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">5. Liability & Disclaimer</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Sweet Home Punta Cana is not liable for accidents, injuries, delays, loss of personal belongings, or dissatisfaction with the excursion experience. Responsibility lies exclusively with the Provider.</li>
                <li>We strongly recommend that guests carry personal travel insurance covering excursions and activities.</li>
              </ul>
            </div>
            
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">6. Governing Law & Disputes</h3>
                <p className="text-muted-foreground">
                    These Terms are governed by the laws of the Dominican Republic. Any disputes shall be resolved exclusively in the competent courts of the Dominican Republic.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-lg">7. Modifications</h3>
                <p className="text-muted-foreground">
                    We reserve the right to update or modify these Terms at any time. The version in effect at the time of booking applies.
                </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">8. Contact</h3>
              <p className="text-muted-foreground">
                For questions about these Terms, please contact us at: <a href="mailto:info@sweethomepc.com" className="underline hover:text-primary">info@sweethomepc.com</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

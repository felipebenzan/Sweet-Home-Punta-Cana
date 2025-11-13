
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Sweet Home Punta Cana',
  description: 'Official Terms of Service for booking and staying at Sweet Home Punta Cana. Includes policies on reservations, payments, cancellations, and guest conduct.',
};

export default function TermsPage() {
  const lastUpdatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-shpc-sand py-12 sm:py-16 pt-[calc(var(--header-height)+3rem)]">
      <div className="max-w-3xl mx-auto px-6">
        <Card className="shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdatedDate}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              These Terms of Service (“Terms”) govern all bookings and stays at Sweet Home Punta Cana (“we,” “our,” “us”). By completing a reservation, you (“guest,” “you”) agree to these Terms.
            </p>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">1. Contractual Relationship</h3>
              <p className="text-muted-foreground">
                Your reservation constitutes a binding agreement between you and Sweet Home Punta Cana. These Terms, together with our Rules & Restrictions and Privacy Statement, form the full agreement governing your stay.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">2. Reservations & Payments</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Reservations are confirmed only after full payment or deposit has been received.</li>
                <li>Prices are displayed in U.S. Dollars (USD) unless stated otherwise.</li>
                <li>Guests are responsible for any bank, credit card, or payment processing fees.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">3. Check-In & Guest Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Check-in begins at 3:00 PM, and check-out is by 11:00 AM.</li>
                <li>Guests must be 18 years or older to stay at the property. No minors are permitted.</li>
                <li>A valid government-issued ID (passport or national ID) is required at check-in.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">4. Guest Responsibilities</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Guests must comply with all house rules, as outlined in the Rules & Restrictions.</li>
                <li>Guests agree to use the property in a respectful and lawful manner.</li>
                <li>Any damages, missing items, or violations of house rules may result in additional charges or termination of the stay without refund.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">5. Cancellations & Refunds</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Refunds are subject to our Rules & Restrictions policy.</li>
                <li>Reservations under USD $100 are refundable only if cancelled at least 72 hours before check-in.</li>
                <li>Reservations over USD $100 require at least 7 days’ notice before check-in to qualify for a refund.</li>
                <li>Late cancellations, same-day cancellations, or no-shows are non-refundable.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">6. Liability & Disclaimer</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Sweet Home Punta Cana is not liable for personal injury, accidents, theft, or loss of personal belongings during your stay.</li>
                <li>Guests are responsible for their own travel insurance.</li>
                <li>We do not guarantee uninterrupted access to utilities or services beyond our reasonable control (e.g., electricity, internet, water supply).</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">7. Termination of Stay</h3>
              <p className="text-muted-foreground">
                We reserve the right to cancel or terminate any booking without refund if:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>A guest violates house rules.</li>
                <li>A guest engages in illegal, unsafe, or disruptive behavior.</li>
                <li>False or fraudulent booking information is provided.</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">8. Governing Law & Disputes</h3>
              <p className="text-muted-foreground">
                These Terms are governed by the laws of the Dominican Republic. Any dispute arising from these Terms shall be resolved exclusively in the competent courts of the Dominican Republic.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">9. Modifications</h3>
              <p className="text-muted-foreground">
                We reserve the right to update or modify these Terms at any time. The version in effect at the time of booking applies to your reservation.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">10. Contact</h3>
              <p className="text-muted-foreground">
                For any questions about these Terms, please contact: <a href="mailto:info@sweethomepc.com" className="underline hover:text-primary">info@sweethomepc.com</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

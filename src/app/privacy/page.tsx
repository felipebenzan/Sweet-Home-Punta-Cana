
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Statement - Sweet Home Punta Cana',
  description: 'Our commitment to protecting your personal information when you book rooms, excursions, or other guest services with us.',
};

export default function PrivacyPage() {
  const lastUpdatedDate = 'September 17, 2025';

  return (
    <div className="bg-shpc-sand py-12 sm:py-16 pt-[calc(var(--header-height)+3rem)]">
      <div className="max-w-3xl mx-auto px-6">
        <Card className="shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Statement</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdatedDate}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Sweet Home Punta Cana (“we,” “our,” “us”) respects your privacy and is committed to protecting your personal information. This Privacy Statement explains how we collect, use, and safeguard your data when you stay with us, book excursions, request transfers, laundry, or use any of our guest services through our website or in person.
            </p>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">1. Information We Collect</h3>
              <p className="text-muted-foreground">
                When you make a reservation or request services, we may collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-semibold text-foreground">Personal details:</span> name, email address, phone number, billing address.</li>
                <li><span className="font-semibold text-foreground">Booking details:</span> check-in/check-out dates, number of guests, room type, excursion selections, transfer details (flight number, pickup time, number of passengers), and laundry service requests.</li>
                <li><span className="font-semibold text-foreground">Payment details:</span> processed securely through third-party providers (we do not store full credit card numbers).</li>
                <li><span className="font-semibold text-foreground">Identification:</span> passport, ID, or other government-issued documents when required by law for guest registration.</li>
                <li><span className="font-semibold text-foreground">Communication data:</span> messages or inquiries sent by email, WhatsApp, website forms, or other channels.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">2. How We Use Your Information</h3>
              <p className="text-muted-foreground">
                We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Manage, confirm, and personalize your booking (accommodation, excursions, transfers, laundry, and related services).</li>
                <li>Coordinate with third-party providers (e.g., excursion operators, transport companies) to fulfill your service requests.</li>
                <li>Process payments and security deposits.</li>
                <li>Communicate important information about your stay or booked services.</li>
                <li>Comply with legal obligations, such as guest registry requirements in the Dominican Republic.</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">3. Sharing of Information</h3>
              <p className="text-muted-foreground">
                We will never sell or trade your personal information. We may share it only with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-semibold text-foreground">Service providers</span> strictly as needed (e.g., payment processors, excursion operators, transport companies, laundry partners) to complete your booking or request.</li>
                <li><span className="font-semibold text-foreground">Government authorities</span> if legally required (e.g., immigration, police, or tax authorities in the Dominican Republic).</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">4. Data Security</h3>
              <p className="text-muted-foreground">
                We use reasonable technical and organizational measures to protect your personal information against unauthorized access, alteration, or misuse.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">5. Data Retention</h3>
              <p className="text-muted-foreground">
                We retain personal information only for as long as necessary to provide services, comply with legal obligations, and maintain business records.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">6. Your Rights</h3>
              <p className="text-muted-foreground">
                Depending on your country of residence, you may have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Access the personal information we hold about you.</li>
                <li>Request corrections or updates to your data.</li>
                <li>Request deletion of your data, unless retention is required by law.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">7. Contact Us</h3>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Statement or how your data is handled, please contact us:
              </p>
              <p className="text-muted-foreground">
                📧 info@sweethomepc.com
              </p>
              <p className="text-muted-foreground">
               📍 Sweet Home Punta Cana, Dominican Republic
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

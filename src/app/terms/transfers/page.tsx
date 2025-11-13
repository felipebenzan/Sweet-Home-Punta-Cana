
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Airport Transfer Policy & Conditions - Sweet Home Punta Cana',
  description: 'Read the official terms, conditions, and policies for booking airport transfer services with Sweet Home Punta Cana, including details on rates, cancellations, and liability.',
};

export default function TransferTermsPage() {
  const lastUpdatedDate = 'October 4, 2025';

  return (
    <div className="bg-shpc-sand py-12 sm:py-16 pt-[calc(var(--header-height)+3rem)]">
      <div className="max-w-3xl mx-auto px-6">
        <Card className="shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl">Transfer Policy and Conditions</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdatedDate}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">1. General Information</h3>
              <p className="text-muted-foreground">
                Airport transfer services offered through Sweet Home Punta Cana are provided by independent third-party transportation partners. Sweet Home Punta Cana acts solely as a facilitator for reservations and payments. By booking a transfer, the guest acknowledges and accepts these terms and conditions.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">2. Service Description</h3>
                <p className="text-muted-foreground">
                    Transfers are private, operated exclusively for the booking guest and their accompanying passengers. Service is available between Punta Cana International Airport (PUJ) and Sweet Home Punta Cana, either as a one-way or round-trip service. All transfers must be booked in advance through our official booking channels.
                </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">3. Rates and Payment</h3>
                <p className="text-muted-foreground">
                    Transfer rates are fixed per ride, inclusive of taxes and standard luggage. All payments are made online at the time of booking. Sweet Home Punta Cana retains a commission as a booking facilitator, while the remaining balance is remitted to the transportation provider.
                </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">4. Booking Confirmation</h3>
                <p className="text-muted-foreground">
                    Upon successful payment, guests will receive a confirmation email containing all relevant details, including pickup time, location, driver information (if available), and emergency contact numbers. Guests are responsible for verifying the accuracy of their booking details.
                </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">5. Cancellations and Refunds</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>72 hours before pickup:</strong> Full refund.</li>
                <li><strong>Between 48 and 72 hours before pickup:</strong> Partial refund (50%).</li>
                <li><strong>Within 24 hours of pickup or in case of no-show:</strong> No refund.</li>
                <li>All cancellation requests must be submitted in writing via the same channel used for the booking.</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">6. Waiting Time and Delays</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>For airport arrivals, drivers will monitor flight schedules and allow a grace period of up to 60 minutes after the flight’s actual landing time. Beyond this period, the service may be considered a no-show.</li>
                <li>For departures from Sweet Home Punta Cana to the airport, the maximum waiting time is 30 minutes from the scheduled pickup time. If the guest is not ready for departure within this period, the service may be deemed forfeited without refund.</li>
                <li>Sweet Home Punta Cana and its partners are not responsible for delays caused by customs procedures, lost luggage, traffic conditions, or any other circumstances beyond their control.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">7. Luggage and Personal Belongings</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Each passenger is entitled to one standard suitcase and one carry-on item. Oversized luggage, sports equipment, or pets must be declared in advance and may incur additional fees.</li>
                <li>Guests are solely responsible for their personal belongings. Neither Sweet Home Punta Cana nor the transportation provider shall be liable for loss or damage to personal property.</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">8. Liability</h3>
              <p className="text-muted-foreground">
                Sweet Home Punta Cana acts only as an intermediary and does not operate the vehicles. Therefore, it assumes no responsibility for accidents, delays, or service interruptions caused by the transportation provider or other third parties. The transportation provider is solely responsible for vehicle safety, insurance, and compliance with local regulations.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">9. Conduct and Safety</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Guests must follow all driver instructions and local transportation regulations.</li>
                <li>Smoking, consumption of alcohol, or inappropriate behavior inside the vehicle is strictly prohibited.</li>
                <li>The driver reserves the right to refuse service to any passenger acting in a manner deemed unsafe or disrespectful.</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">10. Changes to Service</h3>
              <p className="text-muted-foreground">
                Sweet Home Punta Cana reserves the right to modify or update these terms at any time without prior notice. Updated policies will be published on the official website and apply to all future bookings.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">11. Contact Information</h3>
              <p className="text-muted-foreground">
                For booking changes, cancellations, or inquiries, please contact: Sweet Home Punta Cana.
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}

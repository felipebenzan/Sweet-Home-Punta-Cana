import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

async function getBookings() {
  try {
    // Fetch all bookings (reservations + service bookings)
    const reservations = await prisma.reservation.findMany({
      include: { room: true },
      orderBy: { createdAt: 'desc' }
    });

    const serviceBookings = await prisma.serviceBooking.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Map reservations to common structure
    const mappedReservations = reservations.map(r => ({
      confirmationId: r.id,
      type: 'room',
      guestName: r.guestName,
      guestEmail: r.guestEmail,
      customer: {
        name: r.guestName,
        email: r.guestEmail,
        phone: r.guestPhone
      },
      date: r.checkInDate.toISOString().split('T')[0],
      createdAt: r.createdAt.toISOString(),
      totalPrice: r.totalPrice,
      details: {
        checkIn: r.checkInDate.toISOString().split('T')[0],
        checkOut: r.checkOutDate.toISOString().split('T')[0],
        guests: r.numberOfGuests,
        roomName: r.room.name
      },
      status: r.status
    }));

    // Map service bookings to common structure
    const mappedServiceBookings = serviceBookings.map(sb => {
      let details = {};
      try {
        details = sb.details ? JSON.parse(sb.details) : {};
      } catch (e) {
        console.error('Error parsing details for booking', sb.id);
      }

      return {
        confirmationId: sb.id,
        type: sb.type === 'airport_transfer' ? 'transfer' : sb.type,
        guestName: sb.guestName,
        guestEmail: sb.email,
        customer: {
          name: sb.guestName,
          email: sb.email,
          phone: sb.phone
        },
        date: sb.date ? sb.date.toISOString().split('T')[0] : undefined,
        createdAt: sb.createdAt.toISOString(),
        totalPrice: sb.total,
        details: details,
        status: sb.status
      };
    });

    const allBookings = [...mappedReservations, ...mappedServiceBookings].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return allBookings;

  } catch (error) {
    console.warn("Build fetch bypassed or DB error:", error);
    return [];
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'room': return <Home className="h-4 w-4" />;
    case 'transfer': return <Plane className="h-4 w-4" />;
    case 'laundry': return <Shirt className="h-4 w-4" />;
    case 'excursion': return <Calendar className="h-4 w-4" />;
    default: return null;
  }
}

function getTypeBadge(type: string) {
  const colors: Record<string, string> = {
    room: 'bg-blue-100 text-blue-800',
    transfer: 'bg-green-100 text-green-800',
    laundry: 'bg-purple-100 text-purple-800',
    excursion: 'bg-orange-100 text-orange-800',
  };

  return (
    <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
      {getTypeIcon(type)}
      <span className="ml-1 capitalize">{type}</span>
    </Badge>
  );
}

export default async function AdminBookingsPage() {
  const session = await verifySession();

  if (!session) {
    redirect('/admin/login');
  }

  const bookings = await getBookings();

  return (
    <div className="min-h-screen bg-shpc-sand p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">All Bookings</h1>
          <p className="text-muted-foreground">View all reservations and services</p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No bookings yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: any) => (
              <Card key={booking.confirmationId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getTypeBadge(booking.type)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(booking.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <CardTitle className="text-lg">
                        {booking.guestName || booking.customer?.name || 'Guest'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {booking.guestEmail || booking.customer?.email}
                      </p>
                      {booking.customer?.phone && (
                        <p className="text-sm text-muted-foreground">
                          📱 {booking.customer.phone}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${booking.totalPrice?.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {booking.confirmationId}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Room Details */}
                  {booking.type === 'room' && booking.dates && (
                    <div className="space-y-2 text-sm">
                      <p><strong>Check-in:</strong> {booking.dates.checkIn}</p>
                      <p><strong>Check-out:</strong> {booking.dates.checkOut}</p>
                      <p><strong>Guests:</strong> {booking.guests}</p>
                      {booking.rooms && (
                        <p><strong>Rooms:</strong> {booking.rooms.map((r: any) => r.name).join(', ')}</p>
                      )}
                    </div>
                  )}

                  {/* Transfer Details */}
                  {booking.type === 'transfer' && booking.details && (
                    <div className="space-y-2 text-sm">
                      <p><strong>Direction:</strong> {booking.details.direction}</p>
                      {booking.details.arrivalDate && (
                        <p><strong>Arrival:</strong> {booking.details.arrivalDate} - Flight {booking.details.arrivalFlight}</p>
                      )}
                      {booking.details.departureDate && (
                        <p><strong>Departure:</strong> {booking.details.departureDate} at {booking.details.departureTime}</p>
                      )}
                    </div>
                  )}

                  {/* Laundry Details */}
                  {booking.type === 'laundry' && booking.details && (
                    <div className="space-y-2 text-sm">
                      <p><strong>Bags:</strong> {booking.details.bags}</p>
                      <p><strong>Price per bag:</strong> ${booking.details.pricePerBag}</p>
                    </div>
                  )}

                  {/* PayPal Info */}
                  {booking.paypalTransactionId && (
                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                      <p>PayPal Transaction: {booking.paypalTransactionId}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

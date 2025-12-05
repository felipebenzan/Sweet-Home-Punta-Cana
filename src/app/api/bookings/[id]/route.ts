import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    if (!id) {
        return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }

    try {
        // Try to find in ServiceBooking first (for laundry, transfer, excursion)
        const serviceBooking = await prisma.serviceBooking.findUnique({
            where: { id },
            include: { excursion: true }
        });

        if (serviceBooking) {
            return NextResponse.json({ success: true, booking: serviceBooking, type: 'service' });
        }

        // If not found, try Reservation (for rooms)
        const reservation = await prisma.reservation.findUnique({
            where: { id },
            include: { room: true }
        });

        if (reservation) {
            return NextResponse.json({ success: true, booking: reservation, type: 'reservation' });
        }

        return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });

    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

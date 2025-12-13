import { NextRequest, NextResponse } from 'next/server';
import { sendBookingConfirmation } from '@/lib/email-service';
import { checkDailyLimit } from '@/lib/settings';
import { prisma } from '@/lib/prisma';
import { Beds24 } from '@/lib/beds24';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const booking = await request.json();

        // Check daily limits for transfer and laundry services
        if (booking.type === 'transfer' && booking.details) {
            const date = booking.details.arrivalDate || booking.details.departureDate;
            if (date) {
                const availability = await checkDailyLimit('transfer', date);
                if (!availability.allowed) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: `We've reached our capacity for transfers on ${date}. Current: ${availability.current}/${availability.max}`,
                            availabilityInfo: availability
                        },
                        { status: 400 }
                    );
                }
            }
        }

        if (booking.type === 'laundry') {
            const date = booking.date || new Date().toISOString().split('T')[0];
            const availability = await checkDailyLimit('laundry', date);
            if (!availability.allowed) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `We've reached our capacity for laundry on ${date}. Current: ${availability.current}/${availability.max}`,
                        availabilityInfo: availability
                    },
                    { status: 400 }
                );
            }
        }

        let savedBooking;
        let confirmationId;

        if (booking.type === 'room') {
            // Create Reservation
            // Assuming single room for now based on current schema
            // If booking.rooms has multiple, we might need to handle that.
            // For now, we take the first room ID if available, or just use the payload structure.

            // The payload from checkout/page.tsx has:
            // rooms: { id: string, ... }[]
            // dates: { checkIn, checkOut }
            // guestName, guestEmail, etc.

            const roomId = booking.rooms && booking.rooms.length > 0 ? booking.rooms[0].id : 'unknown';

            savedBooking = await prisma.reservation.create({
                data: {
                    roomId: roomId,
                    guestName: booking.guestName,
                    guestEmail: booking.guestEmail,
                    guestPhone: booking.customer.phone,
                    checkInDate: new Date(booking.dates.checkIn),
                    checkOutDate: new Date(booking.dates.checkOut),
                    numberOfGuests: booking.guests,
                    totalPrice: booking.pricing.totalUSD,
                    status: 'Confirmed'
                },
                include: { room: true }
            });
            confirmationId = savedBooking.id;

            // 🟢 INTEGRATE BEDS24: Send booking to Beds24 if room has ID
            if (savedBooking.room && savedBooking.room.beds24_room_id) {
                console.log(`[Beds24] Syncing reservation ${confirmationId} to Beds24 (Room: ${savedBooking.room.beds24_room_id})...`);

                try {
                    const b24Result = await Beds24.setBooking({
                        roomId: savedBooking.room.beds24_room_id,
                        arrival: booking.dates.checkIn.split('T')[0], // Ensure YYYY-MM-DD
                        departure: booking.dates.checkOut.split('T')[0], // Ensure YYYY-MM-DD
                        status: "confirmed", // or "new"
                        numAdult: booking.guests,
                        guestName: booking.guestName,
                        guestEmail: booking.guestEmail,
                        guestPhone: booking.customer.phone,
                        price: booking.pricing.totalUSD,
                        comments: `Booking source: SweetHomePC Website | ID: ${confirmationId}`
                    });

                    if (!b24Result.success) {
                        console.error(`[Beds24] Sync Failed for ${confirmationId}:`, b24Result.debug.error);
                        // Optional: Store error in DB or notify admin?
                    }
                } catch (b24err) {
                    console.error(`[Beds24] Sync Exception for ${confirmationId}:`, b24err);
                }
            } else {
                console.warn(`[Beds24] Skipped sync for ${confirmationId}: Room has no Beds24 ID.`);
            }

            // If there is a transfer included, we should create a ServiceBooking for it too?
            // The current payload has `transfer` object.
            if (booking.transfer) {
                const transferBooking = await prisma.serviceBooking.create({
                    data: {
                        type: 'airport_transfer',
                        serviceType: 'airport_transfer',
                        guestName: booking.guestName,
                        email: booking.guestEmail,
                        phone: booking.customer.phone,
                        date: booking.transfer.arrivalDate ? new Date(booking.transfer.arrivalDate) : undefined,
                        total: booking.transfer.price,
                        pax: `${booking.guests} Guests`,
                        status: 'Confirmed',
                        reservationId: savedBooking.id,
                        details: JSON.stringify({
                            airline: booking.transfer.airline,
                            flightNumber: booking.transfer.flightNumber,
                            returnDate: booking.transfer.returnDate,
                            returnFlightNumber: booking.transfer.returnFlightNumber
                        })
                    }
                });

                // Send separate email for transfer
                try {
                    await sendBookingConfirmation({
                        guestName: booking.guestName,
                        guestEmail: booking.guestEmail,
                        bookingType: 'transfer',
                        bookingDetails: booking.transfer,
                        confirmationId: transferBooking.id,
                        totalPrice: booking.transfer.price,
                    });
                } catch (emailError) {
                    console.error('Failed to send transfer confirmation email:', emailError);
                }
            }

        } else {
            // Service Booking (Laundry, Transfer, Excursion)
            // Map generic booking payload to ServiceBooking
            savedBooking = await prisma.serviceBooking.create({
                data: {
                    type: booking.type === 'transfer' ? 'airport_transfer' : booking.type,
                    serviceType: booking.type,
                    excursionId: booking.excursionId || booking.details?.mainExcursion?.id,
                    guestName: booking.guestName || booking.customer?.name,
                    email: booking.guestEmail || booking.customer?.email,
                    phone: booking.phone || booking.customer?.phone,
                    date: booking.date ? new Date(booking.date) : (
                        booking.details?.arrivalDate ? new Date(booking.details.arrivalDate) : (
                            booking.details?.departureDate ? new Date(booking.details.departureDate) : (
                                booking.details?.mainExcursion?.bookingDate ? new Date(booking.details.mainExcursion.bookingDate) : undefined
                            )
                        )
                    ),
                    total: booking.totalPrice || booking.pricing?.totalUSD,
                    pax: booking.pax || (booking.guests ? `${booking.guests} Guests` : (booking.details?.mainExcursion?.adults ? `${booking.details.mainExcursion.adults} Guests` : undefined)),
                    status: 'Confirmed',
                    details: JSON.stringify(
                        booking.type === 'laundry' ? {
                            bags: booking.details?.bags,
                            pickupTime: booking.details?.pickupTime,
                            roomNumber: booking.details?.roomNumber,
                            specialInstructions: booking.details?.specialInstructions,
                            pricePerBag: booking.details?.pricePerBag
                        } : booking.type === 'excursion' ? {
                            mainExcursion: booking.details?.mainExcursion,
                            bundledItems: booking.details?.bundledItems,
                            bundleDiscount: booking.details?.bundleDiscount
                        } : booking.details
                    )
                }
            });
            confirmationId = savedBooking.id;
        }

        // Send confirmation email (async, don't await to speed up response?)
        // Better to await to ensure it sends, or handle error.
        try {
            // Extract phone from payload or customer object to ensure it is available for the email
            const phone = booking.phone || booking.customer?.phone || '';

            await sendBookingConfirmation({
                guestName: booking.guestName || booking.customer?.name || 'Guest',
                guestEmail: booking.guestEmail || booking.customer?.email || '',
                bookingType: booking.type || 'room',
                bookingDetails: {
                    ...booking,
                    phone // Explicitly pass the resolved phone number
                },
                confirmationId,
                totalPrice: booking.totalPrice || booking.pricing?.totalUSD || 0,
            });
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Continue, don't fail the booking
        }

        console.log(`✅ Booking saved to SQLite: ${confirmationId}`);

        return NextResponse.json({
            success: true,
            confirmationId,
            booking: savedBooking,
        });

    } catch (error) {
        console.error('❌ Booking API error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to process booking' },
            { status: 500 }
        );
    }
}

export async function GET() {
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

        return NextResponse.json({ bookings: allBookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ bookings: [] });
    }
}

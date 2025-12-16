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

            // Create Reservations (Multi-Room Support)
            // Iterate over all rooms in the payload and create a separate reservation for each.
            const roomsToBook = (booking.rooms && booking.rooms.length > 0) ? booking.rooms : (booking.room ? [booking.room] : []);

            if (roomsToBook.length === 0) {
                throw new Error("No rooms specified in booking payload.");
            }

            const createdReservations = [];

            for (const roomItem of roomsToBook) {
                // Parse capacity "2 Adults" -> 2
                const capacityInt = parseInt(roomItem.capacity) || 2;

                const savedBooking = await prisma.reservation.create({
                    data: {
                        roomId: roomItem.id, // Use ID from specific room item
                        guestName: booking.guestName,
                        guestEmail: booking.guestEmail,
                        guestPhone: booking.customer.phone,
                        checkInDate: new Date(booking.dates.checkIn),
                        checkOutDate: new Date(booking.dates.checkOut),
                        numberOfGuests: capacityInt, // Use room capacity as default guest count for that room
                        totalPrice: roomItem.price, // Use room specific price (Total Price)
                        status: 'Confirmed'
                    },
                    include: { room: true }
                });

                createdReservations.push(savedBooking);

                // Use the ID of the first reservation as the primary "Group Confirmation ID" for reference
                if (!confirmationId) confirmationId = savedBooking.id;

                // 🟢 INTEGRATE BEDS24: Send booking to Beds24
                if (savedBooking.room && savedBooking.room.beds24_room_id) {
                    console.log(`[Beds24] Syncing reservation ${savedBooking.id} to Beds24 (Room: ${savedBooking.room.beds24_room_id})...`);

                    try {
                        const b24Result = await Beds24.setBooking({
                            roomId: String(savedBooking.room.beds24_room_id),
                            arrival: booking.dates.checkIn.split('T')[0], // Ensure YYYY-MM-DD
                            departure: booking.dates.checkOut.split('T')[0], // Ensure YYYY-MM-DD
                            status: 1, // 1 = Confirmed
                            numAdult: capacityInt, // Book for max capacity of room
                            guestName: booking.guestName,
                            guestFirstName: booking.customer?.name?.split(' ')[0] || 'Guest', // Improve name parsing if possible
                            guestEmail: booking.guestEmail,
                            guestPhone: booking.customer.phone,
                            price: roomItem.price,
                            comments: `Booking source: SweetHomePC Website | ID: ${savedBooking.id} | Group Ref: ${confirmationId}`
                        });

                        if (!b24Result.success) {
                            console.error(`[Beds24] Sync Failed for ${savedBooking.id}:`, b24Result.debug.error);
                        } else {
                            console.log(`[Beds24] Sync Success for ${savedBooking.id}. BookID: ${b24Result.debug.rawResponse?.bookId}`);
                        }
                    } catch (b24err) {
                        console.error(`[Beds24] Sync Exception for ${savedBooking.id}:`, b24err);
                    }
                } else {
                    console.warn(`[Beds24] Skipped sync for ${savedBooking.id}: Room has no Beds24 ID.`);
                }
            }

            // Fallback for savedBooking reference in later code (use the last one or first one)
            // savedBooking variable matches the loop scope? No, it was declared outside.
            // We update the outer savedBooking to the first one just for reference/Transfer logic if needed.
            savedBooking = createdReservations[0];

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
                    phone,
                    // Pass ALL rooms
                    rooms: booking.rooms || [booking.room],
                    checkInDate: booking.dates?.checkIn,
                    checkOutDate: booking.dates?.checkOut,
                    numberOfGuests: booking.guests,
                    // Main room ref for header image if needed, or email service handles index 0
                    room: booking.rooms?.[0] || booking.room
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
            // Legacy/Generic Date
            date: r.checkInDate.toISOString().split('T')[0],
            createdAt: r.createdAt.toISOString(),
            totalPrice: r.totalPrice,

            // 🟢 Calendar-Compatible Structure
            dates: {
                checkIn: r.checkInDate.toISOString().split('T')[0],
                checkOut: r.checkOutDate.toISOString().split('T')[0]
            },
            rooms: r.room ? [{ name: r.room.name, slug: r.room.slug }] : [],
            guests: r.numberOfGuests,

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

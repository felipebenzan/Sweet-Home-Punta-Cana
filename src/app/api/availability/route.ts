import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Beds24 } from '@/lib/beds24';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const arrival = searchParams.get('arrival');
        const departure = searchParams.get('departure');
        const numAdults = parseInt(searchParams.get('numAdults') || '1');
        const preferredRoomId = searchParams.get('preferred_room_id');

        if (!arrival || !departure) {
            return NextResponse.json(
                { error: 'Arrival and departure dates are required' },
                { status: 400 }
            );
        }

        // 1. Fetch all rooms from Local DB
        const localRooms = await prisma.room.findMany();

        // 2. Extract Beds24 IDs
        const beds24Ids = localRooms
            .map(r => r.beds24_room_id)
            .filter((id): id is string => !!id);

        // 3. Call Beds24 API
        const beds24Data = await Beds24.getAvailability({
            arrival,
            departure,
            numAdults,
            roomIds: beds24Ids
        });

        // 4. Merge Data
        const mergedRooms = localRooms.map(room => {
            const b24 = room.beds24_room_id ? beds24Data[room.beds24_room_id] : null;

            // If we have Beds24 data, use it. Otherwise fallback to local data (or assume available for dev)
            // In production, missing Beds24 data might mean "not connected" or "unavailable"
            const isAvailable = b24 ? b24.available : true; // Fallback to true for dev if no ID
            const finalPrice = b24 ? b24.price : room.price;

            let parsedAmenities: string[] = [];
            try {
                parsedAmenities = JSON.parse(room.amenities);
            } catch (e) {
                // Fallback or log error
            }

            let parsedGallery: string[] = [];
            if (room.gallery) {
                try {
                    parsedGallery = JSON.parse(room.gallery);
                } catch (e) {
                    // Fallback
                }
            }

            return {
                ...room,
                amenities: parsedAmenities,
                gallery: parsedGallery,
                price: finalPrice,
                isAvailable,
                beds24Details: b24
            };
        });

        // 5. Filter & Sort Logic
        const availableRooms = mergedRooms.filter(r => r.isAvailable);

        // Scenario 2: Targeted Search
        if (preferredRoomId) {
            const preferredRoom = mergedRooms.find(r => r.id === preferredRoomId || r.slug === preferredRoomId);

            if (preferredRoom) {
                if (preferredRoom.isAvailable) {
                    // IF AVAILABLE: Put at top
                    const others = availableRooms.filter(r => r.id !== preferredRoom.id);
                    return NextResponse.json({
                        status: 'preferred_available',
                        rooms: [preferredRoom, ...others],
                        message: `Good news! ${preferredRoom.name} is available.`
                    });
                } else {
                    // IF UNAVAILABLE: Show error + others
                    return NextResponse.json({
                        status: 'preferred_unavailable',
                        rooms: availableRooms, // Just the others
                        preferredRoomName: preferredRoom.name,
                        message: `Sorry, ${preferredRoom.name} is not available for these dates.`
                    });
                }
            }
        }

        // Scenario 1: Global Search
        if (availableRooms.length === 0) {
            return NextResponse.json({
                status: 'fully_booked',
                rooms: [],
                message: 'Sorry, we are fully booked for these dates.'
            });
        }

        return NextResponse.json({
            status: 'success',
            rooms: availableRooms,
            message: 'Select your accommodation'
        });

    } catch (error) {
        console.error('Availability Search Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

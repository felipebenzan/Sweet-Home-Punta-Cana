import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Room } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Helper to map Prisma room to Type room
function mapPrismaRoom(room: any): Room {
    return {
        ...room,
        amenities: JSON.parse(room.amenities),
        gallery: room.gallery ? JSON.parse(room.gallery) : [],
    };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (slug) {
            const room = await prisma.room.findUnique({
                where: { slug },
            });

            if (room) {
                return NextResponse.json({ success: true, room: mapPrismaRoom(room) });
            } else {
                return NextResponse.json(
                    { success: false, error: 'Room not found' },
                    { status: 404 }
                );
            }
        }

        const rooms = await prisma.room.findMany();
        return NextResponse.json({ success: true, rooms: rooms.map(mapPrismaRoom) });
    } catch (error) {
        console.error('Failed to get rooms:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to load rooms' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const roomData: Room = await request.json();

        // Check if slug already exists
        const existingRoom = await prisma.room.findUnique({
            where: { slug: roomData.slug },
        });

        if (existingRoom) {
            return NextResponse.json(
                { success: false, error: 'A room with this slug already exists' },
                { status: 400 }
            );
        }

        const newRoom = await prisma.room.create({
            data: {
                slug: roomData.slug,
                name: roomData.name,
                tagline: roomData.tagline,
                description: roomData.description,
                bedding: roomData.bedding,
                capacity: roomData.capacity,
                price: roomData.price,
                image: roomData.image,
                amenities: JSON.stringify(roomData.amenities),
                gallery: JSON.stringify(roomData.gallery || []),
                inventoryUnits: roomData.inventoryUnits || 1,
                cancellationPolicy: roomData.cancellationPolicy,
            },
        });

        return NextResponse.json({ success: true, room: mapPrismaRoom(newRoom) });
    } catch (error) {
        console.error('Failed to create room:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create room' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const roomData: Room = await request.json();

        if (!roomData.id) {
            return NextResponse.json(
                { success: false, error: 'Room ID required' },
                { status: 400 }
            );
        }

        const updatedRoom = await prisma.room.update({
            where: { id: roomData.id },
            data: {
                slug: roomData.slug,
                name: roomData.name,
                tagline: roomData.tagline,
                description: roomData.description,
                bedding: roomData.bedding,
                capacity: roomData.capacity,
                price: roomData.price,
                image: roomData.image,
                amenities: JSON.stringify(roomData.amenities),
                gallery: JSON.stringify(roomData.gallery || []),
                inventoryUnits: roomData.inventoryUnits,
                cancellationPolicy: roomData.cancellationPolicy,
            },
        });

        return NextResponse.json({ success: true, room: mapPrismaRoom(updatedRoom) });
    } catch (error) {
        console.error('Failed to update room:', error);
        // Check for record not found
        if ((error as any).code === 'P2025') {
            return NextResponse.json(
                { success: false, error: 'Room not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to update room' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Room ID required' },
                { status: 400 }
            );
        }

        await prisma.room.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete room:', error);
        if ((error as any).code === 'P2025') {
            return NextResponse.json(
                { success: false, error: 'Room not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to delete room' },
            { status: 500 }
        );
    }
}

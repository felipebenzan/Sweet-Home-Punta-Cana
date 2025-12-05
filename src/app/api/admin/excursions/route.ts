import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Excursion } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Helper to map Prisma Excursion to Frontend Excursion type
function mapExcursion(excursion: any): Excursion {
    return {
        ...excursion,
        inclusions: JSON.parse(excursion.inclusions),
        practicalInfo: {
            departure: excursion.departure,
            duration: excursion.duration,
            pickup: excursion.pickup,
            pickupMapLink: excursion.pickupMapLink,
            notes: JSON.parse(excursion.notes),
        },
        gallery: JSON.parse(excursion.gallery),
        price: { adult: excursion.priceAdult },
        // Promo is not in schema yet, handling gracefully if needed or ignoring
        promo: { headline: "", subheadline: "" }
    };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (slug) {
            const excursion = await prisma.excursion.findUnique({ where: { slug } });
            if (excursion) {
                return NextResponse.json({ success: true, excursion: mapExcursion(excursion) });
            } else {
                return NextResponse.json(
                    { success: false, error: 'Excursion not found' },
                    { status: 404 }
                );
            }
        }

        const excursions = await prisma.excursion.findMany();
        return NextResponse.json({ success: true, excursions: excursions.map(mapExcursion) });
    } catch (error) {
        console.error('Failed to get excursions:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to load excursions' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data: Excursion = await request.json();

        // Check if slug already exists
        const existing = await prisma.excursion.findUnique({ where: { slug: data.slug } });
        if (existing) {
            return NextResponse.json(
                { success: false, error: 'An excursion with this slug already exists' },
                { status: 400 }
            );
        }

        const newExcursion = await prisma.excursion.create({
            data: {
                slug: data.slug,
                title: data.title,
                tagline: data.tagline,
                description: data.description,
                image: data.image,
                icon: data.icon || "Sailboat",
                priceAdult: data.price.adult,
                inclusions: JSON.stringify(data.inclusions),
                departure: data.practicalInfo.departure,
                duration: data.practicalInfo.duration,
                pickup: data.practicalInfo.pickup,
                pickupMapLink: data.practicalInfo.pickupMapLink,
                notes: JSON.stringify(data.practicalInfo.notes),
                gallery: JSON.stringify(data.gallery),
            }
        });

        return NextResponse.json({ success: true, excursion: mapExcursion(newExcursion) });
    } catch (error) {
        console.error('Failed to create excursion:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create excursion' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const data: Excursion = await request.json();

        if (!data.id) {
            return NextResponse.json(
                { success: false, error: 'Excursion ID required for update' },
                { status: 400 }
            );
        }

        const updatedExcursion = await prisma.excursion.update({
            where: { id: data.id },
            data: {
                slug: data.slug,
                title: data.title,
                tagline: data.tagline,
                description: data.description,
                image: data.image,
                icon: data.icon,
                priceAdult: data.price.adult,
                inclusions: JSON.stringify(data.inclusions),
                departure: data.practicalInfo.departure,
                duration: data.practicalInfo.duration,
                pickup: data.practicalInfo.pickup,
                pickupMapLink: data.practicalInfo.pickupMapLink,
                notes: JSON.stringify(data.practicalInfo.notes),
                gallery: JSON.stringify(data.gallery),
            }
        });

        return NextResponse.json({ success: true, excursion: mapExcursion(updatedExcursion) });
    } catch (error) {
        console.error('Failed to update excursion:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update excursion' },
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
                { success: false, error: 'Excursion ID required' },
                { status: 400 }
            );
        }

        await prisma.excursion.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete excursion:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete excursion' },
            { status: 500 }
        );
    }
}

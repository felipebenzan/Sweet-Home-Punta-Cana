import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const excursions = await prisma.excursion.findMany({
            select: {
                id: true,
                slug: true,
                title: true,
                image: true
            }
        });

        return NextResponse.json({
            success: true,
            count: excursions.length,
            excursions
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

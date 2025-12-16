import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const slug = 'saona-island';
        const newData = {
            image: '/saona-hero.png',
            gallery: JSON.stringify([
                '/saona-3.jpeg',
                '/saona-2.jpeg',
                '/saona-4.jpeg'
            ])
        };

        console.log(`Updating ${slug} with images:`, newData);

        const updated = await prisma.excursion.update({
            where: { slug },
            data: newData
        });

        return NextResponse.json({
            success: true,
            message: 'Saona Island images updated successfully',
            data: updated
        });
    } catch (error: any) {
        console.error('Update failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Unknown error'
        }, { status: 500 });
    }
}

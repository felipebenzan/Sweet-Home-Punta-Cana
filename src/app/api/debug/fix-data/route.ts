import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const messages = [];

        // 1. Fix Saona
        await prisma.excursion.update({
            where: { slug: 'saona-island' },
            data: {
                image: '/saona-hero.png',
                gallery: JSON.stringify(['/saona-3.jpeg', '/saona-2.jpeg', '/saona-4.jpeg'])
            }
        });
        messages.push('Fixed Saona Island');

        // 2. Fix Buggies
        await prisma.excursion.update({
            where: { slug: 'buggy-adventure' },
            data: {
                image: '/buggies-hero.png',
                gallery: JSON.stringify(['/buggies-hero.png', '/buggies-1.jpeg', '/buggies-2.jpeg', '/buggies-3.jpeg'])
            }
        });
        messages.push('Fixed Buggy Adventure');

        // 3. Fix Santo Domingo (Deduplication)
        // Find all potential Santo Domingo records
        const santos = await prisma.excursion.findMany({
            where: {
                OR: [
                    { slug: 'santo-domingo' },
                    { title: { contains: 'Santo Domingo' } }
                ]
            }
        });

        if (santos.length === 0) {
            // Create it if it doesn't exist at all
            await prisma.excursion.create({
                data: {
                    id: 'santo-domingo',
                    slug: 'santo-domingo',
                    title: 'Santo Domingo City Tour',
                    tagline: 'Explore the oldest city in the Americas',
                    description: 'Immerse yourself in history with a visit to Santo Domingo, the first city established in the Americas. Walk through the Colonial Zone, a UNESCO World Heritage site, visit the first cathedral, the Alcázar de Colón, and the National Pantheon. This full-day cultural experience includes round-trip transportation, a delicious Dominican lunch, and a professional guide to share the rich history of the island.',
                    image: '/santo-domingo-hero.png',
                    icon: 'Landmark',
                    priceAdult: 95,
                    inclusions: JSON.stringify([
                        'Round-trip transportation',
                        'Professional guide',
                        'Lunch in the Colonial Zone',
                        'Entrance fees to monuments',
                        'Visit to First Cathedral',
                        'Alcázar de Colón',
                        'Calle Las Damas',
                        'Free time for shopping'
                    ]),
                    departure: '7:00 AM',
                    duration: 'Full day (approx. 10 hours)',
                    pickup: 'Hotel lobby',
                    pickupMapLink: null,
                    notes: JSON.stringify([
                        'Dress code: shoulders and knees covered for Cathedral',
                        'Comfortable walking shoes recommended',
                        'Bring camera and sunglasses',
                        'Money for souvenirs',
                        'Long bus ride (approx. 2.5 hours each way)'
                    ]),
                    gallery: JSON.stringify([
                        '/santo-domingo-hero.png',
                        '/santo-domingo-1.jpeg',
                        '/santo-domingo-2.jpeg',
                        '/santo-domingo-3.jpeg'
                    ])
                }
            });
            messages.push('Created Missing Santo Domingo Excursion');
        } else {
            // We have one or more. Pick the "best" one (prefer explicit slug 'santo-domingo', or just the first)
            let target = santos.find(s => s.slug === 'santo-domingo');
            if (!target) target = santos[0];

            // Update the target to be perfect
            await prisma.excursion.update({
                where: { id: target.id },
                data: {
                    slug: 'santo-domingo', // Force slug
                    title: 'Santo Domingo City Tour',
                    tagline: 'Explore the oldest city in the Americas',
                    description: 'Immerse yourself in history with a visit to Santo Domingo, the first city established in the Americas. Walk through the Colonial Zone, a UNESCO World Heritage site, visit the first cathedral, the Alcázar de Colón, and the National Pantheon. This full-day cultural experience includes round-trip transportation, a delicious Dominican lunch, and a professional guide to share the rich history of the island.',
                    image: '/santo-domingo-hero.png',
                    icon: 'Landmark',
                    priceAdult: 95,
                    inclusions: JSON.stringify([
                        'Round-trip transportation',
                        'Professional guide',
                        'Lunch in the Colonial Zone',
                        'Entrance fees to monuments',
                        'Visit to First Cathedral',
                        'Alcázar de Colón',
                        'Calle Las Damas',
                        'Free time for shopping'
                    ]),
                    departure: '7:00 AM',
                    duration: 'Full day (approx. 10 hours)',
                    pickup: 'Hotel lobby',
                    pickupMapLink: null,
                    notes: JSON.stringify([
                        'Dress code: shoulders and knees covered for Cathedral',
                        'Comfortable walking shoes recommended',
                        'Bring camera and sunglasses',
                        'Money for souvenirs',
                        'Long bus ride (approx. 2.5 hours each way)'
                    ]),
                    gallery: JSON.stringify([
                        '/santo-domingo-hero.png',
                        '/santo-domingo-1.jpeg',
                        '/santo-domingo-2.jpeg',
                        '/santo-domingo-3.jpeg'
                    ])
                }
            });
            messages.push(`Updated Canonical Santo Domingo (ID: ${target.id})`);

            // Delete the others
            const others = santos.filter(s => s.id !== target!.id);
            for (const other of others) {
                await prisma.excursion.delete({ where: { id: other.id } });
                messages.push(`Deleted Duplicate Santo Domingo (ID: ${other.id}, Slug: ${other.slug})`);
            }
        }

        return NextResponse.json({
            success: true,
            messages
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

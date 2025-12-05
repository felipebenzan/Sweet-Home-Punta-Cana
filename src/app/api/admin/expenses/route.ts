import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { providerName, amount, month, ncf, description } = body;

        // Find provider by name (simplification for now)
        const provider = await prisma.provider.findFirst({
            where: { name: providerName }
        });

        if (!provider) {
            return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
        }

        const expense = await prisma.monthlyExpense.create({
            data: {
                providerId: provider.id,
                amount,
                month: new Date(month + '-01'), // YYYY-MM -> YYYY-MM-01
                ncf,
                description
            }
        });

        return NextResponse.json({ success: true, expense });
    } catch (error) {
        console.error('Error creating expense:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

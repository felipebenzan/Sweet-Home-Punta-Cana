import { NextRequest, NextResponse } from 'next/server';
import { checkDailyLimit } from '@/lib/settings';

export async function POST(request: NextRequest) {
    try {
        const { date, serviceType } = await request.json();

        if (!date || !serviceType) {
            return NextResponse.json(
                { success: false, error: 'Date and service type are required' },
                { status: 400 }
            );
        }

        // Check availability for the requested date
        const availability = await checkDailyLimit(serviceType, date);

        return NextResponse.json({
            success: true,
            available: availability.allowed,
            current: availability.current,
            max: availability.max,
            enabled: availability.enabled,
        });

    } catch (error) {
        console.error('❌ Check availability error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to check availability' },
            { status: 500 }
        );
    }
}

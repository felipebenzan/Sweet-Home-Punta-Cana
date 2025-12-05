import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/settings';

export async function GET() {
    try {
        const settings = await getSettings();
        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Failed to get settings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to load settings' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const settings = await request.json();
        await updateSettings(settings);

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Failed to update settings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to save settings' },
            { status: 500 }
        );
    }
}

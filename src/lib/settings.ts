import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export interface ServiceLimits {
    airportTransfer: {
        maxPerDay: number;
        enabled: boolean;
    };
    laundry: {
        maxLoadsPerDay: number;
        enabled: boolean;
    };
}

export interface Settings {
    serviceLimits: ServiceLimits;
    businessHours: {
        start: string;
        end: string;
    };
}

const settingsPath = join(process.cwd(), 'src', 'data', 'settings.json');

export async function getSettings(): Promise<Settings> {
    try {
        const fileContent = await readFile(settingsPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        // Return default settings if file doesn't exist
        return {
            serviceLimits: {
                airportTransfer: {
                    maxPerDay: 4,
                    enabled: true,
                },
                laundry: {
                    maxLoadsPerDay: 4,
                    enabled: true,
                },
            },
            businessHours: {
                start: '08:00',
                end: '20:00',
            },
        };
    }
}

export async function updateSettings(settings: Settings): Promise<void> {
    await writeFile(settingsPath, JSON.stringify(settings, null, 2));
}

export async function checkDailyLimit(
    type: 'transfer' | 'laundry',
    date: string
): Promise<{ allowed: boolean; current: number; max: number; enabled: boolean }> {
    const settings = await getSettings();

    // Get the limit configuration
    const limitConfig = type === 'transfer'
        ? settings.serviceLimits.airportTransfer
        : settings.serviceLimits.laundry;

    // If limits are disabled, always allow
    if (!limitConfig.enabled) {
        return {
            allowed: true,
            current: 0,
            max: (limitConfig as any).maxPerDay || (limitConfig as any).maxLoadsPerDay || 999,
            enabled: false,
        };
    }

    // Count bookings from Prisma
    // We need to import prisma dynamically or at top level. 
    // Since this is a server-side function, we can import from @/lib/prisma
    const { prisma } = await import('@/lib/prisma');

    let count = 0;

    if (type === 'transfer') {
        // Count transfer bookings for this date
        // Note: The ServiceBooking model stores date as DateTime. 
        // We need to match the date part.
        // Prisma doesn't have a direct "date only" filter for DateTime easily without raw query or range.
        // Let's use a range for the whole day.
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        count = await prisma.serviceBooking.count({
            where: {
                type: 'airport_transfer', // Matches the type used in createServiceBooking
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });
    } else {
        // Laundry
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        count = await prisma.serviceBooking.count({
            where: {
                type: 'laundry',
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });
    }

    const max = type === 'transfer'
        ? (limitConfig as { maxPerDay: number; enabled: boolean }).maxPerDay
        : (limitConfig as { maxLoadsPerDay: number; enabled: boolean }).maxLoadsPerDay;

    return {
        allowed: count < max,
        current: count,
        max,
        enabled: true,
    };
}

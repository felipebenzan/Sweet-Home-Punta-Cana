'use server';

import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { DateTime } from 'luxon';

// Schema for updating base price
const UpdateBasePriceSchema = z.object({
    roomId: z.string().min(1), // Relaxed from uuid() to support legacy IDs
    basePrice: z.number().min(0),
});

export async function updateRoomBasePrice(roomId: string, basePrice: number) {
    const session = await verifySession();
    if (!session) {
        return { success: false, error: 'Unauthorized' };
    }

    const result = UpdateBasePriceSchema.safeParse({ roomId, basePrice });
    if (!result.success) {
        return { success: false, error: 'Invalid data' };
    }

    try {
        const room = await prisma.room.update({
            where: { id: roomId },
            data: { basePrice },
        });

        revalidatePath('/admin/rooms');
        revalidatePath(`/admin/rooms/edit/${room.slug}`);

        return { success: true, room };
    } catch (error) {
        console.error('Failed to update base price:', error);
        return { success: false, error: 'Database error' };
    }
}

// Schema for upserting daily rate
const UpsertDailyRateSchema = z.object({
    roomId: z.string().min(1), // Relaxed from uuid()
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date string",
    }),
    price: z.number().min(0),
});

export async function upsertDailyRate(roomId: string, dateStr: string, price: number) {
    const session = await verifySession();
    if (!session) {
        return { success: false, error: 'Unauthorized' };
    }

    const result = UpsertDailyRateSchema.safeParse({ roomId, date: dateStr, price });
    if (!result.success) {
        return { success: false, error: 'Invalid data' };
    }

    // Normalize date to UTC 00:00:00 to avoid timezone issues
    // We expect dateStr to be YYYY-MM-DD
    const dateObj = new Date(dateStr);
    // Ensure we save it as a date object that Prisma handles correctly
    // Best practice: Set to noon or specific UTC time if strictly needed, but simple Date(YYYY-MM-DD) usually works as 00:00 UTC

    try {
        const rate = await prisma.dailyRate.upsert({
            where: {
                roomId_date: {
                    roomId,
                    date: dateObj,
                },
            },
            update: {
                price,
            },
            create: {
                roomId,
                date: dateObj,
                price,
            },
        });

        return { success: true, rate };
    } catch (error) {
        console.error('Failed to upsert daily rate:', error);
        return { success: false, error: 'Database error' };
    }
}

export async function deleteDailyRate(roomId: string, dateStr: string) {
    const session = await verifySession();
    if (!session) {
        return { success: false, error: 'Unauthorized' };
    }

    const dateObj = new Date(dateStr);

    try {
        await prisma.dailyRate.delete({
            where: {
                roomId_date: {
                    roomId,
                    date: dateObj,
                },
            },
        });

        return { success: true };
    } catch (error) {
        // If it doesn't exist, we can consider it success or ignore
        if ((error as any).code === 'P2025') {
            return { success: true }; // Record to delete does not exist
        }
        console.error('Failed to delete daily rate:', error);
        return { success: false, error: 'Database error' };
    }
}

export async function getDailyRates(roomId: string, startStr: string, endStr: string) {
    const session = await verifySession();
    if (!session) {
        return { success: false, error: 'Unauthorized' };
    }

    const start = new Date(startStr);
    const end = new Date(endStr);

    try {
        const rates = await prisma.dailyRate.findMany({
            where: {
                roomId,
                date: {
                    gte: start,
                    lte: end,
                },
            },
        });

        return {
            success: true, rates: rates.map(r => ({
                ...r,
                date: r.date.toISOString(), // Return simple ISO strings for client
            }))
        };
    } catch (error) {
        console.error('Failed to fetch daily rates:', error);
        return { success: false, error: 'Database error' };
    }
}
export async function bulkUpdateDailyRates(roomId: string, updates: { date: string; price: number }[]) {
    const session = await verifySession();
    if (!session) {
        return { success: false, error: 'Unauthorized' };
    }

    // Validate inputs
    const updatesSchema = z.array(z.object({
        date: z.string().refine((val) => !isNaN(Date.parse(val))),
        price: z.number().min(0),
    }));

    const result = updatesSchema.safeParse(updates);
    if (!result.success) {
        return { success: false, error: 'Invalid data format' };
    }

    try {
        // We use a transaction to ensure all or nothing
        // Prisma's createMany is nice, but we need upsert (update if exists).
        // createMany with skipDuplicates ignores updates.
        // So we might need to delete valid existing then createMany, OR loop upserts in transaction.
        // For < 100 items, loop in transaction is fine.

        await prisma.$transaction(
            updates.map((update) => {
                const dateObj = new Date(update.date);
                return prisma.dailyRate.upsert({
                    where: {
                        roomId_date: {
                            roomId,
                            date: dateObj,
                        },
                    },
                    update: { price: update.price },
                    create: {
                        roomId,
                        date: dateObj,
                        price: update.price,
                    },
                });
            })
        );

        return { success: true };
    } catch (error) {
        console.error('Failed to bulk update rates:', error);
        return { success: false, error: 'Database error' };
    }
}

export async function bulkDeleteDailyRates(roomId: string, dates: string[]) {
    const session = await verifySession();
    if (!session) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const dateObjs = dates.map(d => new Date(d));
        await prisma.dailyRate.deleteMany({
            where: {
                roomId,
                date: { in: dateObjs }
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to bulk delete rates:', error);
        return { success: false, error: 'Database error' };
    }
}

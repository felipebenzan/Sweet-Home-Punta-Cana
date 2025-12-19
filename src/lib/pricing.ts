
import { prisma } from '@/lib/prisma';
import { DateTime } from 'luxon';

/**
 * Calculates the total price for a stay based on the room's base price
 * and any specific daily rates defined in the database.
 * 
 * @param roomId The ID of the room
 * @param checkIn Check-in date (Date object or ISO string)
 * @param checkOut Check-out date (Date object or ISO string)
 * @returns The total calculated price for the stay
 */
export async function calculateBookingPrice(
    roomId: string,
    checkIn: Date | string,
    checkOut: Date | string
): Promise<number> {
    const start = typeof checkIn === 'string' ? DateTime.fromISO(checkIn) : DateTime.fromJSDate(checkIn);
    const end = typeof checkOut === 'string' ? DateTime.fromISO(checkOut) : DateTime.fromJSDate(checkOut);

    if (!start.isValid || !end.isValid) {
        throw new Error('Invalid dates provided to calculateBookingPrice');
    }

    if (end <= start) {
        throw new Error('Check-out date must be after check-in date');
    }

    // Fetch the room to get the base price
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: { basePrice: true, price: true } // Fallback to 'price' if basePrice is missing (legacy)
    });

    if (!room) {
        throw new Error(`Room with ID ${roomId} not found`);
    }

    // Use basePrice if available, otherwise fallback to the legacy 'price' field
    const basePrice = room.basePrice ?? room.price;

    // Calculate number of nights
    const nights = end.diff(start, 'days').days;

    // Fetch all daily rates that fall within the stay range
    // We look for rates >= start AND < end (since the checkout day itself isn't priced)
    const dailyRates = await prisma.dailyRate.findMany({
        where: {
            roomId: roomId,
            date: {
                gte: start.toJSDate(),
                lt: end.toJSDate(),
            },
        },
    });

    // Create a map for quick lookup: "YYYY-MM-DD" -> price
    const rateMap = new Map<string, number>();
    dailyRates.forEach(rate => {
        // Ensure we format the date consistent with how we loop
        const dateKey = DateTime.fromJSDate(rate.date).toISODate(); // "YYYY-MM-DD"
        if (dateKey) {
            rateMap.set(dateKey, rate.price);
        }
    });

    let totalPrice = 0;

    // Iterate through each night
    for (let i = 0; i < nights; i++) {
        const currentNight = start.plus({ days: i });
        const dateKey = currentNight.toISODate(); // "YYYY-MM-DD"

        if (dateKey && rateMap.has(dateKey)) {
            totalPrice += rateMap.get(dateKey)!;
        } else {
            totalPrice += basePrice;
        }
    }

    return parseFloat(totalPrice.toFixed(2));
}

/**
 * Helper to get a map of rates for a date range, useful for the frontend calendar.
 */
export async function getRoomRates(roomId: string, startDate: Date, endDate: Date) {
    const rates = await prisma.dailyRate.findMany({
        where: {
            roomId,
            date: {
                gte: startDate,
                lte: endDate
            }
        }
    });

    return rates.map(r => ({
        date: r.date,
        price: r.price
    }));
}

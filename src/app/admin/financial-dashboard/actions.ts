'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function assignProvider(lineItemId: string, providerId: string) {
    try {
        // 1. Get the provider to know their default cost method/value
        const provider = await prisma.provider.findUnique({
            where: { id: providerId }
        });

        if (!provider) {
            throw new Error('Provider not found');
        }

        // 2. Get the line item to calculate the cost
        const lineItem = await prisma.bookingLineItem.findUnique({
            where: { id: lineItemId }
        });

        if (!lineItem) {
            throw new Error('Line item not found');
        }

        // 3. Calculate Cost
        let costMethod = provider.defaultCostMethod || 'FIXED_NET_RATE';
        let costValue = provider.defaultCostValue || 0;
        let totalCost = 0;

        if (costMethod === 'FIXED_NET_RATE') {
            // e.g. $50 per person * quantity
            totalCost = costValue * lineItem.quantity;
        } else if (costMethod === 'PERCENTAGE_COMMISSION') {
            // e.g. 10% of Total Gross
            totalCost = lineItem.totalGross * costValue;
        }

        // 4. Update the Line Item
        await prisma.bookingLineItem.update({
            where: { id: lineItemId },
            data: {
                providerId: provider.id,
                costMethod,
                costValue,
                totalCost
            }
        });

        // 5. Recalculate Booking Totals (Net Profit changed)
        // We need to fetch the booking and all its items to sum up again
        const booking = await prisma.booking.findUnique({
            where: { id: lineItem.bookingId },
            include: { lineItems: true }
        });

        if (booking) {
            let newTotalNet = booking.totalGross - booking.totalTax;
            // Subtract all costs
            booking.lineItems.forEach(item => {
                newTotalNet -= item.totalCost;
            });

            await prisma.booking.update({
                where: { id: booking.id },
                data: { totalNet: newTotalNet }
            });
        }

        revalidatePath('/admin/financial-dashboard');
        return { success: true };

    } catch (error) {
        console.error('Error assigning provider:', error);
        return { success: false, error: 'Failed to assign provider' };
    }
}

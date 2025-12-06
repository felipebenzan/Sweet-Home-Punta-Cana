import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getProviderData(providerId: string, startDate: Date, endDate: Date) {
    try {
        const [provider, lineItems] = await Promise.all([
            prisma.provider.findUnique({ where: { id: providerId } }),
            prisma.bookingLineItem.findMany({
                where: {
                    providerId: providerId,
                    booking: {
                        date: { gte: startDate, lte: endDate }
                    }
                },
                include: { booking: true },
                orderBy: { booking: { date: 'asc' } }
            })
        ]);
        return { provider, lineItems };
    } catch (e) {
        console.warn('Build-time DB fetch failed', e);
        return { provider: null, lineItems: [] };
    }
}

export default async function ProviderDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { month?: string } }) {
    const session = await verifySession();
    if (!session) redirect('/admin/login');

    // Date Filtering
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const selectedMonthStr = searchParams.month || currentMonthStr;

    const [year, month] = selectedMonthStr.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const { provider, lineItems } = await getProviderData(params.id, startDate, endDate);

    if (!provider) return <div>Provider not found</div>;

    const totalOwed = lineItems.reduce((sum, item) => sum + item.totalCost, 0);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/admin/financial-dashboard?month=${selectedMonthStr}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
                    <p className="text-gray-500">
                        Statement for {startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export PDF
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Payable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">${totalOwed.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Services Provided</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{lineItems.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Provider Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 capitalize">{provider.type.toLowerCase()}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Service Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Guest</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Service</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Qty</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Cost Method</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Total Owed</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {lineItems.map((item) => (
                                    <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle">{new Date(item.booking.date).toLocaleDateString()}</td>
                                        <td className="p-4 align-middle">{item.booking.guestName}</td>
                                        <td className="p-4 align-middle">{item.description}</td>
                                        <td className="p-4 align-middle">{item.quantity}</td>
                                        <td className="p-4 align-middle text-right">
                                            {item.costMethod === 'FIXED_NET_RATE'
                                                ? `$${item.costValue}/unit`
                                                : `${(item.costValue * 100).toFixed(0)}% Comm.`}
                                        </td>
                                        <td className="p-4 align-middle text-right font-bold">${item.totalCost.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {lineItems.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-gray-500">No services found for this month.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

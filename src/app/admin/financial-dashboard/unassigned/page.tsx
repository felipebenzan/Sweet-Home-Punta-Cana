import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { AssignProviderDropdown } from './assign-provider-dropdown';

export default async function UnassignedServicesPage() {
    const session = await verifySession();
    if (!session) redirect('/admin/login');

    // Fetch unassigned line items (excluding Accommodation which is usually internal/Octorate)
    // We assume ACCOMMODATION type doesn't need a provider assignment flow here unless specified
    const unassignedItems = await prisma.bookingLineItem.findMany({
        where: {
            providerId: null,
            type: { not: 'ACCOMMODATION' } // Filter out rooms if desired, or keep them if you assign housekeepers
        },
        include: {
            booking: true
        },
        orderBy: {
            booking: { date: 'desc' }
        }
    });

    const providers = await prisma.provider.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/financial-dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Unassigned Services</h1>
                    <p className="text-gray-500">Assign providers to calculate costs and payables.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        Pending Assignments ({unassignedItems.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {unassignedItems.map(item => (
                            <div key={item.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white border rounded-lg shadow-sm gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline">{item.type}</Badge>
                                        <span className="font-semibold text-gray-900">{item.description}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {new Date(item.booking.date).toLocaleDateString()} • {item.booking.guestName}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Qty: {item.quantity} • Gross: ${item.totalGross.toFixed(2)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <AssignProviderDropdown
                                        lineItemId={item.id}
                                        providers={providers}
                                    />
                                </div>
                            </div>
                        ))}

                        {unassignedItems.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <p>All services have been assigned to providers.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, Users, Building, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { MonthFilter } from './month-filter';

export default async function FinancialDashboard({ searchParams }: { searchParams: { month?: string } }) {
    const session = await verifySession();
    if (!session) redirect('/admin/login');

    // Date Filtering Logic
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const selectedMonthStr = searchParams.month || currentMonthStr;

    const [year, month] = selectedMonthStr.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month

    // Fetch Data Filtered by Date
    const bookings = await prisma.booking.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            lineItems: {
                include: { provider: true }
            }
        },
        orderBy: { date: 'desc' }
    });

    const monthlyExpenses = await prisma.monthlyExpense.findMany({
        where: {
            month: {
                gte: startDate,
                lte: endDate
            }
        },
        include: { provider: true },
        orderBy: { month: 'desc' }
    });

    // Check for unassigned items (global check, not just this month, to alert user)
    const unassignedCount = await prisma.bookingLineItem.count({
        where: {
            providerId: null,
            type: { not: 'ACCOMMODATION' }
        }
    });

    // Calculations & Provider Breakdown
    let totalIncome = 0;
    let totalTaxLiability = 0;
    let totalVendorPayable = 0;
    let totalStaffPayable = 0;
    let totalPlatformFees = 0;

    const providerTotals: Record<string, { id: string, name: string, type: string, amount: number }> = {};

    bookings.forEach(booking => {
        totalIncome += booking.totalGross;
        totalTaxLiability += booking.totalTax;

        booking.lineItems.forEach(item => {
            if (item.provider) {
                const pId = item.provider.id;
                if (!providerTotals[pId]) {
                    providerTotals[pId] = {
                        id: pId,
                        name: item.provider.name,
                        type: item.provider.type,
                        amount: 0
                    };
                }
                providerTotals[pId].amount += item.totalCost;

                if (item.provider.type === 'VENDOR') {
                    totalVendorPayable += item.totalCost;
                } else if (item.provider.type === 'STAFF') {
                    totalStaffPayable += item.totalCost;
                }
            }
        });
    });

    monthlyExpenses.forEach(expense => {
        totalPlatformFees += expense.amount;
    });

    const totalLiabilities = totalTaxLiability + totalVendorPayable + totalStaffPayable + totalPlatformFees;
    const netProfit = totalIncome - totalLiabilities;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Financial Command Center</h1>
                    <p className="text-gray-500">Real-time Net Profit & Liability Tracking</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Month Filter Component */}
                    <MonthFilter defaultMonth={selectedMonthStr} />

                    <div className="text-right bg-white p-3 rounded-lg border shadow-sm min-w-[150px]">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Net Profit</p>
                        <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Unassigned Alert */}
            {unassignedCount > 0 && (
                <div className="mb-6">
                    <Link href="/admin/financial-dashboard/unassigned">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex justify-between items-center hover:bg-orange-100 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                                <div>
                                    <h3 className="font-semibold text-orange-900">Unassigned Services Detected</h3>
                                    <p className="text-sm text-orange-700">You have {unassignedCount} services without a provider. Assign them to calculate accurate costs.</p>
                                </div>
                            </div>
                            <Button variant="outline" className="border-orange-300 text-orange-800 hover:bg-orange-200">
                                Assign Now <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT COLUMN: INCOME STREAM */}
                <div className="space-y-6">
                    <Card className="border-l-4 border-l-green-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex justify-between items-center text-lg">
                                <span className="flex items-center gap-2">
                                    <ArrowUpRight className="h-5 w-5 text-green-500" />
                                    Income Stream ({startDate.toLocaleDateString('en-US', { month: 'long' })})
                                </span>
                                <span className="text-2xl font-bold text-green-600">
                                    ${totalIncome.toLocaleString()}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {bookings.map(booking => (
                                    <div key={booking.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">{booking.guestName}</span>
                                                {booking.source === 'DIRECT' ? (
                                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">Direct</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-blue-600 border-blue-200">{booking.source}</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {new Date(booking.date).toLocaleDateString()} • {booking.lineItems.length} items
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">+${booking.totalGross.toFixed(2)}</p>
                                            <p className="text-xs text-gray-400">Gross</p>
                                        </div>
                                    </div>
                                ))}
                                {bookings.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">No bookings found for this month.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: ACCOUNTS PAYABLE & LIABILITIES */}
                <div className="space-y-6">
                    <Card className="border-l-4 border-l-red-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex justify-between items-center text-lg">
                                <span className="flex items-center gap-2">
                                    <ArrowDownRight className="h-5 w-5 text-red-500" />
                                    Liabilities & Payables
                                </span>
                                <span className="text-2xl font-bold text-red-600">
                                    ${totalLiabilities.toLocaleString()}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* TAX LIABILITY */}
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2 text-red-900 font-semibold">
                                        <Building className="h-4 w-4" />
                                        Tax Liability (DGII 18%)
                                    </div>
                                    <span className="text-lg font-bold text-red-700">${totalTaxLiability.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-red-600/80">Accumulated ITBIS from taxable sales. Do not spend.</p>
                            </div>

                            {/* VENDOR PAYABLES */}
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2 text-orange-900 font-semibold">
                                        <Users className="h-4 w-4" />
                                        To Pay Vendors
                                    </div>
                                    <span className="text-lg font-bold text-orange-700">${totalVendorPayable.toLocaleString()}</span>
                                </div>
                                <div className="mt-3 space-y-2">
                                    {Object.values(providerTotals).filter(p => p.type === 'VENDOR').map(p => (
                                        <Link key={p.id} href={`/admin/financial-dashboard/providers/${p.id}?month=${selectedMonthStr}`}>
                                            <div className="flex justify-between text-sm p-2 bg-white/50 rounded hover:bg-white cursor-pointer transition-colors">
                                                <span className="text-orange-900">{p.name}</span>
                                                <span className="font-medium text-orange-700">${p.amount.toFixed(2)}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* STAFF PAYABLES */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2 text-blue-900 font-semibold">
                                        <Users className="h-4 w-4" />
                                        To Pay Staff
                                    </div>
                                    <span className="text-lg font-bold text-blue-700">${totalStaffPayable.toLocaleString()}</span>
                                </div>
                                <div className="mt-3 space-y-2">
                                    {Object.values(providerTotals).filter(p => p.type === 'STAFF').map(p => (
                                        <Link key={p.id} href={`/admin/financial-dashboard/providers/${p.id}?month=${selectedMonthStr}`}>
                                            <div className="flex justify-between text-sm p-2 bg-white/50 rounded hover:bg-white cursor-pointer transition-colors">
                                                <span className="text-blue-900">{p.name}</span>
                                                <span className="font-medium text-blue-700">${p.amount.toFixed(2)}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* PLATFORM FEES */}
                            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                        <Wallet className="h-4 w-4" />
                                        Platform Fees
                                    </div>
                                    <span className="text-lg font-bold text-gray-700">${totalPlatformFees.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-gray-600">Monthly invoices from Booking.com, Expedia, etc.</p>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-semibold mb-2">Recent Expenses</h4>
                                    {monthlyExpenses.map(expense => (
                                        <div key={expense.id} className="flex justify-between text-sm mb-1">
                                            <span>{expense.provider.name}</span>
                                            <span className="font-medium text-red-600">-${expense.amount}</span>
                                        </div>
                                    ))}
                                    <div className="mt-3">
                                        <Link href="/admin/financial-dashboard/expenses">
                                            <Button variant="outline" size="sm" className="w-full">
                                                Add Monthly Expense
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

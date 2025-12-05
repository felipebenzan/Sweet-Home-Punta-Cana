import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { readFile } from 'fs/promises';
import { join } from 'path';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, Package, Plane, Shirt, Home, LogOut } from 'lucide-react';

async function getBookings() {
  try {
    const bookingsPath = join(process.cwd(), 'src', 'data', 'bookings.json');
    const fileContent = await readFile(bookingsPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return [];
  }
}

export default async function AdminDashboard() {
  const session = await verifySession();

  if (!session) {
    redirect('/admin/login');
  }

  const bookings = await getBookings();

  // Calculate stats
  const totalBookings = bookings.length;
  const roomBookings = bookings.filter((b: any) => b.type === 'room').length;
  const transferBookings = bookings.filter((b: any) => b.type === 'transfer').length;
  const laundryBookings = bookings.filter((b: any) => b.type === 'laundry').length;
  const excursionBookings = bookings.filter((b: any) => b.type === 'excursion').length;

  const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);

  return (
    <div className="min-h-screen bg-shpc-sand p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Sweet Home Punta Cana</p>
          </div>
          <form action="/api/admin/logout" method="POST">
            <Button type="submit" variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Room Bookings</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roomBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Airport Transfers</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transferBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Laundry Services</CardTitle>
              <Shirt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{laundryBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Excursions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{excursionBookings}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/bookings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>View All Bookings</CardTitle>
                <CardDescription>See all reservations and services</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/excursions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Manage Excursions</CardTitle>
                <CardDescription>Add, edit, or remove tours</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/rooms">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Manage Rooms</CardTitle>
                <CardDescription>Edit room details and pricing</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

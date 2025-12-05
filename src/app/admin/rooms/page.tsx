import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { readFile } from 'fs/promises';
import { join } from 'path';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, FilePenLine } from 'lucide-react';
import type { Room } from '@/lib/types';

async function getRooms(): Promise<Room[]> {
  try {
    const roomsPath = join(process.cwd(), 'src', 'data', 'rooms.json');
    const fileContent = await readFile(roomsPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return [];
  }
}

export default async function AdminRoomsPage() {
  const session = await verifySession();

  if (!session) {
    redirect('/admin/login');
  }

  const rooms = await getRooms();

  return (
    <div className="p-4 sm:p-6 bg-shpc-sand min-h-full">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-shpc-ink">Manage Rooms</h1>
          <p className="text-muted-foreground">
            Edit room details, pricing, and availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90">
            <Link href="/admin/rooms/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Room
            </Link>
          </Button>
        </div>
      </header>
      <Card className="shadow-soft rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Bed Type</TableHead>
                <TableHead className="hidden md:table-cell">Capacity</TableHead>
                <TableHead className="hidden md:table-cell">Price/Night</TableHead>
                <TableHead className="hidden md:table-cell text-center">
                  Units
                </TableHead>
                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms && rooms.length > 0 ? (
                rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Image
                          alt={room.name}
                          className="aspect-square rounded-md object-cover"
                          height="40"
                          src={room.image || 'https://picsum.photos/seed/room-placeholder/40/40'}
                          width="40"
                        />
                        <div>
                          <div>{room.name}</div>
                          <div className="text-xs text-muted-foreground">{room.tagline}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{room.bedding}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {room.capacity} guests
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="font-semibold">${room.price}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center">
                      <Badge variant={(room.inventoryUnits || 0) > 0 ? 'default' : 'secondary'}>
                        {room.inventoryUnits || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/rooms/edit/${room.slug}`}>
                          <FilePenLine className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No rooms found. Add your first room to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

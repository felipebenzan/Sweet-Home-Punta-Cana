
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, FilePenLine } from 'lucide-react';
import type { Room } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function AdminRoomsPage() {
  const db = useFirestore();

  const roomsQuery = useMemoFirebase(() => 
    db ? collection(db, 'rooms') : null
  , [db]);

  const { data: rooms, isLoading } = useCollection<Room>(roomsQuery);

  return (
    <div className="p-4 sm:p-6 bg-shpc-sand min-h-full">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-shpc-ink">Rooms</h1>
          <p className="text-muted-foreground">
            Manage your room inventory, content, and public visibility.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90">
            <Link href="/admin/rooms/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Room
            </Link>
          </Button>
        </div>
      </header>
      <Card className="shadow-soft rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Bed Type</TableHead>
                <TableHead className="hidden md:table-cell">Capacity</TableHead>
                <TableHead className="hidden md:table-cell text-center">
                  Published
                </TableHead>
                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`skel-${i}`}>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-12" /></TableCell>
                    <TableCell className="hidden md:table-cell text-center"><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : rooms && rooms.length > 0 ? (
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
                          data-ai-hint="hotel room"
                        />
                        <span>{room.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{room.bedding}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {room.capacity}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center">
                      <Badge variant={(room.inventoryUnits || 0) > 0 ? 'default' : 'secondary'}>
                        {(room.inventoryUnits || 0) > 0 ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button asChild variant="outline" size="sm">
                         <Link href={`/admin/rooms/edit/${room.slug}`}>
                          <FilePenLine className="mr-2 h-4 w-4"/>
                          Edit
                         </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No rooms found.
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

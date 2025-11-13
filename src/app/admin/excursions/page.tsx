
'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, FilePenLine } from 'lucide-react';
import type { Excursion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminExcursionsPage() {
  const db = useFirestore();

  const excursionsQuery = useMemoFirebase(() => 
    db ? collection(db, 'excursions') : null
  , [db]);

  const { data: excursions, isLoading } = useCollection<Excursion>(excursionsQuery);

  return (
    <div className="p-4 sm:p-6 bg-shpc-sand min-h-full">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-shpc-ink">Excursions</h1>
          <p className="text-muted-foreground">
            Manage your tour and activity offerings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90">
            <Link href="/admin/excursions/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Excursion
            </Link>
          </Button>
        </div>
      </header>
      <Card className="shadow-soft rounded-2xl">
        <CardContent className="p-0">
          <Table>
             <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Price (Adult)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`skel-${i}`}>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : excursions && excursions.length > 0 ? (
                excursions.map((excursion) => (
                  <TableRow key={excursion.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Image
                          alt={excursion.title}
                          className="aspect-square rounded-md object-cover"
                          height="40"
                          src={excursion.image}
                          width="40"
                          data-ai-hint="vacation excursion"
                        />
                        <span>{excursion.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">${excursion.price.adult.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/excursions/edit/${excursion.slug}`}>
                          <FilePenLine className="mr-2 h-4 w-4"/>
                          Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    No excursions found.
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

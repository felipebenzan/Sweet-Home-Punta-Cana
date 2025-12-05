import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { readFile } from 'fs/promises';
import { join } from 'path';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, FilePenLine } from 'lucide-react';
import type { Excursion } from '@/lib/types';

async function getExcursions(): Promise<Excursion[]> {
  try {
    const excursionsPath = join(process.cwd(), 'src', 'data', 'excursions.json');
    const fileContent = await readFile(excursionsPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return [];
  }
}

export default async function AdminExcursionsPage() {
  const session = await verifySession();

  if (!session) {
    redirect('/admin/login');
  }

  const excursions = await getExcursions();

  return (
    <div className="p-4 sm:p-6 bg-shpc-sand min-h-full">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-shpc-ink">Manage Excursions</h1>
          <p className="text-muted-foreground">
            Add, edit, or remove tour offerings with custom pricing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90">
            <Link href="/admin/excursions/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Excursion
            </Link>
          </Button>
        </div>
      </header>
      <Card className="shadow-soft rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Excursion</TableHead>
                <TableHead className="hidden md:table-cell">Tagline</TableHead>
                <TableHead className="hidden md:table-cell">Price (Adult)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {excursions && excursions.length > 0 ? (
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
                        />
                        <span>{excursion.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {excursion.tagline}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="font-semibold">${excursion.price.adult.toFixed(2)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/excursions/edit/${excursion.slug}`}>
                          <FilePenLine className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No excursions found. Add your first excursion to get started.
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

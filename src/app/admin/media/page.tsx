
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function MediaLibraryPage() {
  return (
    <div className="p-4 sm:p-6 bg-shpc-sand min-h-full">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-shpc-ink">Media Library</h1>
        </div>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Feature Removed</CardTitle>
          <CardDescription>
            The Media Library has been removed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This feature is no longer available.</p>
        </CardContent>
      </Card>
    </div>
  );
}

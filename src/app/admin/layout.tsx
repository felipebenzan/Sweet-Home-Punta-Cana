import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import Header from '@/components/header';
import React from 'react';
import { verifySession } from '@/lib/auth';
import { AdminSidebar } from './admin-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  const userRole = session?.role as string || 'COLLABORATOR';
  const userPermissions = (session?.permissions as string[]) || [];

  return (
    <div className="relative">
      <Header />
      <SidebarProvider>
        <AdminSidebar
          userRole={userRole}
          userPermissions={userPermissions}
        />
        <SidebarInset>
          <div className="h-full pt-16">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

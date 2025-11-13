
'use client';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { DollarSign, CalendarDays, Home, Bed, Hotel, Sailboat, ConciergeBell, LogOut, Star } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/header';
import React, { useEffect } from 'react';
import { useAuth, useUser } from '@/firebase/auth/use-user';
import { signOut } from 'firebase/auth';

const mainNavItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/admin/rooms', label: 'Rooms', icon: Bed },
  { href: '/admin/availability', label: 'Availability', icon: Hotel },
];

const servicesNavItems = [
   { href: '/admin/excursions', label: 'Excursions', icon: Sailboat },
  { href: '/admin/guest-services', label: 'Service Bookings', icon: ConciergeBell },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    // If auth is not loading and there's no user, redirect to login.
    // This effect should only handle the "not logged in" case.
    if (!isUserLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isUserLoading, isAuthenticated, pathname, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/admin/login');
    }
  };

  // While checking auth state, show a loading screen for all admin pages except login.
  if (isUserLoading && pathname !== '/admin/login') {
    return (
        <div className="flex items-center justify-center h-screen bg-shpc-sand">
            <p className="font-semibold text-lg">Loading...</p>
        </div>
    );
  }

  // If not authenticated and not on login page, show a redirecting message.
  // This prevents content flashing while the useEffect redirect kicks in.
  if (!isAuthenticated && pathname !== '/admin/login') {
     return (
        <div className="flex items-center justify-center h-screen bg-shpc-sand">
            <p className="font-semibold text-lg">Redirecting to login...</p>
        </div>
    );
  }
  
  // If on the login page, render children directly (the login page handles its own logic).
  if (pathname === '/admin/login') {
    return <div>{children}</div>;
  }

  // If authenticated, render the full admin layout.
  return (
    <div className="relative">
      <Header />
      <SidebarProvider>
          <>
            <Sidebar className="top-16 h-[calc(100vh-4rem)]">
              <SidebarHeader>
                <div className="flex items-center justify-between">
                  <Link href="/admin" className="font-bold text-lg text-sidebar-foreground">Admin</Link>
                  <SidebarTrigger />
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  {mainNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin')}
                        tooltip={{ children: item.label }}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
                <SidebarSeparator />
                <SidebarMenu>
                  {servicesNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                        tooltip={{ children: item.label }}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
                <div className="mt-auto">
                   <SidebarSeparator />
                    <SidebarMenuItem>
                       <SidebarMenuButton onClick={handleLogout}>
                         <LogOut/>
                         <span>Logout</span>
                       </SidebarMenuButton>
                    </SidebarMenuItem>
                </div>
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <div className="h-full pt-16">
                  {children}
              </div>
            </SidebarInset>
          </>
      </SidebarProvider>
    </div>
  );
}

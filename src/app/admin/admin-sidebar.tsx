'use client';

import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { DollarSign, CalendarDays, Home, Bed, Hotel, Sailboat, ConciergeBell, LogOut, Star, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface AdminSidebarProps {
    userRole: string;
    userPermissions: string[];
}

const mainNavItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/financial-dashboard', label: 'Financial Command Center', icon: DollarSign },
    { href: '/admin/bookings/rooms', label: 'Room Bookings', icon: Bed },
    { href: '/admin/bookings/services', label: 'Service Bookings', icon: ConciergeBell },
];

const managementNavItems = [
    { href: '/admin/rooms', label: 'Manage Rooms', icon: Hotel },
    { href: '/admin/excursions', label: 'Manage Excursions', icon: Sailboat },
    { href: '/admin/users', label: 'Team Access', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ userRole, userPermissions }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    const hasAccess = (href: string) => {
        if (userRole === 'ADMIN') return true;
        if (userPermissions?.includes('*')) return true;
        return userPermissions?.includes(href);
    };

    const filteredManagementItems = managementNavItems.filter(item => hasAccess(item.href));

    return (
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
                <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Management</p>
                </div>
                <SidebarMenu>
                    {filteredManagementItems.map((item) => (
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
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}

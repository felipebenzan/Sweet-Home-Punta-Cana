'use server';

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getUsers() {
    return prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            permissions: true,
            createdAt: true,
        }
    });
}

export async function createUser(data: any) {
    try {
        const hashedPassword = await hashPassword(data.password);

        await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role,
                permissions: JSON.stringify(data.permissions),
            },
        });

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Create user error:', error);
        return { success: false, error: 'Failed to create user' };
    }
}

export async function updateUser(id: string, data: any) {
    try {
        const updateData: any = {
            email: data.email,
            name: data.name,
            role: data.role,
            permissions: JSON.stringify(data.permissions),
        };

        if (data.password) {
            updateData.password = await hashPassword(data.password);
        }

        await prisma.user.update({
            where: { id },
            data: updateData,
        });

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Update user error:', error);
        return { success: false, error: 'Failed to update user' };
    }
}

export async function deleteUser(id: string) {
    try {
        await prisma.user.delete({
            where: { id },
        });

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Delete user error:', error);
        return { success: false, error: 'Failed to delete user' };
    }
}

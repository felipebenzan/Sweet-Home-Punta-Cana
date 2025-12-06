import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Use singleton
import { verifyPassword, createSession, hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

// const prisma = new PrismaClient(); // Removed in favor of singleton import

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, message: 'Missing credentials' }, { status: 400 });
        }

        // 1. Check if ANY user exists (First Run Pattern)
        const userCount = await prisma.user.count();

        if (userCount === 0) {
            console.log('🚀 First Run: No users in DB. Creating first Admin...');
            try {
                const hashedPassword = await hashPassword(password);
                const newUser = await prisma.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        name: 'Admin', // Default name, can be changed later
                        role: 'ADMIN',
                        permissions: JSON.stringify(['*']),
                    }
                });

                // Login immediately
                await createSession({
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                    permissions: JSON.parse(newUser.permissions),
                });

                return NextResponse.json({
                    success: true,
                    message: `Setup Complete! Account created for ${email}.`
                });
            } catch (setupError) {
                console.error('Setup failed:', setupError);
                return NextResponse.json({ success: false, message: 'Setup failed' }, { status: 500 });
            }
        }

        // 2. Normal Login Flow
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
        }

        // Create session
        await createSession({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: JSON.parse(user.permissions),
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Login error details:', error);
        return NextResponse.json({
            success: false,
            message: `Login Error: ${error?.message || 'Unknown error'}`
        }, { status: 500 });
    }
}

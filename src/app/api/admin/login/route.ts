import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyPassword, createSession, hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, message: 'Missing credentials' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // EMERGENCY FIX: Auto-healing for Production
            // If the admin user is missing (empty DB), create it on the fly.
            if (email === 'admin@sweethome.com' && password === 'Admin123!') {
                console.log('⚠️ Admin user missing. Auto-creating admin user...');
                try {
                    const hashedPassword = await hashPassword(password);
                    const newUser = await prisma.user.create({
                        data: {
                            email: 'admin@sweethome.com',
                            password: hashedPassword,
                            name: 'Admin User',
                            role: 'ADMIN',
                            permissions: JSON.stringify(['*']), // Full access
                        }
                    });

                    // Log the user in immediately
                    await createSession({
                        id: newUser.id,
                        email: newUser.email,
                        name: newUser.name,
                        role: newUser.role,
                        permissions: JSON.parse(newUser.permissions),
                    });

                    return NextResponse.json({ success: true, message: 'Admin recovered and logged in' });
                } catch (createError) {
                    console.error('Failed to auto-create admin:', createError);
                    return NextResponse.json({ success: false, message: 'Database Error: Could not create admin' }, { status: 500 });
                }
            }

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

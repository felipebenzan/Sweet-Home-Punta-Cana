import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyPassword, createSession } from '@/lib/auth';

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
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

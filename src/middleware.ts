import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-me');

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect admin routes (except login page)
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const session = request.cookies.get('admin_session');

        if (!session?.value) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            const { payload } = await jwtVerify(session.value, SECRET_KEY);

            // Check for RBAC if needed
            // For now, just ensuring a valid token exists is enough to let them in,
            // but we can add granular checks here if we want to block specific routes at the edge.

            // Example: if (payload.role !== 'ADMIN' && pathname.startsWith('/admin/users')) ...

        } catch (error) {
            // Invalid token
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};

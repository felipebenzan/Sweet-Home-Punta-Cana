import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-me');
const ALG = 'HS256';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function createSession(payload: any) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: ALG })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(SECRET_KEY);

    cookies().set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

export async function verifySession() {
    const cookie = cookies().get('admin_session');
    if (!cookie?.value) return null;

    try {
        const { payload } = await jwtVerify(cookie.value, SECRET_KEY, {
            algorithms: [ALG],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function clearAdminSession() {
    cookies().delete('admin_session');
}

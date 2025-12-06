
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () => {
    // EMERGENCY FIX: Hardcoded connection string as reliable fallback
    // The environment variables are not being picked up by the Vercel Runtime for some reason.
    const hardcodedUrl = "postgresql://neondb_owner:npg_h7Uw4SsnPNat@ep-delicate-water-adb9hua3-pooler.c-2.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require";

    // Robust URL discovery: Try Vercel Postgres vars first, then standard DATABASE_URL
    const url = process.env.POSTGRES_PRISMA_URL ||
        process.env.POSTGRES_URL ||
        process.env.DATABASE_URL ||
        hardcodedUrl; // Fallback to hardcoded

    // If we are in a build environment (no URL), use a dummy connection string
    // to prevent the build from crashing. 
    if (!url) {
        console.warn("WARN: No Database URL found (checked POSTGRES_PRISMA_URL, POSTGRES_URL, DATABASE_URL).");
        console.warn("Using dummy connection for build/static generation.");
        return new PrismaClient({
            datasources: {
                db: {
                    url: 'postgresql://build:build@localhost:5432/build',
                },
            },
        });
    }

    // Log which one was used (for debugging logs)
    // console.log(`Connecting to DB using discovered URL (Length: ${ url.length })`);

    return new PrismaClient({
        datasources: {
            db: {
                url: url,
            },
        },
    });
};

export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

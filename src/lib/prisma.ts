import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () => {
    // Robust URL discovery: Try Vercel Postgres vars first, then standard DATABASE_URL
    const url = process.env.POSTGRES_PRISMA_URL ||
        process.env.POSTGRES_URL ||
        process.env.DATABASE_URL;

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
    // console.log(`Connecting to DB using discovered URL (Length: ${url.length})`);

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

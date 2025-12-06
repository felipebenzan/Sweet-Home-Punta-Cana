import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () => {
    const url = process.env.DATABASE_URL;

    // Explicit check to confirm if Vercel is injecting the variable
    if (!url) {
        throw new Error("CRITICAL ERROR: DATABASE_URL is missing from runtime environment variables.");
    }

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

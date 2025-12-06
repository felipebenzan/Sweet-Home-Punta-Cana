import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () => {
    const url = process.env.DATABASE_URL;

    // If we are in a build environment (no URL), use a dummy connection string
    // to prevent the build from crashing. 
    if (!url) {
        console.warn("WARN: DATABASE_URL is missing. Using dummy connection for build/static generation.");
        return new PrismaClient({
            datasources: {
                db: {
                    url: 'postgresql://build:build@localhost:5432/build',
                },
            },
        });
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

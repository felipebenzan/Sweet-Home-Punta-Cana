import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () => {
    // If in production/runtime with valid env, let Prisma read from schema
    if (process.env.POSTGRES_PRISMA_URL) {
        return new PrismaClient({
            log: ['query'],
        });
    }

    // Fallback for build time if environment variables are missing
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://build:build@localhost:5432/build';
    return new PrismaClient({
        log: ['query'],
        datasources: {
            db: {
                url: databaseUrl,
            },
        },
    });
};

export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

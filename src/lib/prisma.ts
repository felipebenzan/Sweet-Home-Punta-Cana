import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Fallback for build time if environment variables are missing
const databaseUrl = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || 'postgresql://build:build@localhost:5432/build';

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'],
        datasources: {
            db: {
                url: databaseUrl,
            },
        },
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

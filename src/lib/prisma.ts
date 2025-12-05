import { PrismaClient } from '@prisma/client';

// Explicitly set the environment variable to ensure Prisma finds the DB
process.env.DATABASE_URL = 'file:/Users/felipebenzan/Desktop/Sweet home antigravity/Sweet-Home-Punta-Cana/prisma/dev.db';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'],
        datasources: {
            db: {
                url: 'file:/Users/felipebenzan/Desktop/Sweet home antigravity/Sweet-Home-Punta-Cana/prisma/dev.db',
            },
        },
    });
console.log("Prisma Client Initialized. DATABASE_URL:", process.env.DATABASE_URL);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

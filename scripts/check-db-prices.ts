
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function checkPrices() {
    console.log("Checking Room Prices...");
    const rooms = await prisma.room.findMany();
    rooms.forEach(r => {
        console.log(`Room: ${r.name} | Price: ${r.price} | Beds24 ID: ${r.beds24_room_id}`);
    });
}

checkPrices()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());


import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function checkCapacity() {
    console.log("Checking Room Capacity...");
    const rooms = await prisma.room.findMany();
    rooms.forEach(r => {
        console.log(`Room: ${r.name} | ID: ${r.beds24_room_id} | Capacity: ${r.capacity}`);
    });
}

checkCapacity()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

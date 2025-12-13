
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function checkRooms() {
    console.log("Checking Room IDs...");
    const rooms = await prisma.room.findMany();
    rooms.forEach(r => {
        console.log(`Room: ${r.name} | ID: ${r.id} | Beds24 ID: ${r.beds24_room_id}`);
    });
}

checkRooms()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const rooms = await prisma.room.findMany();
    console.log("--- Room Configuration ---");
    rooms.forEach(r => {
        console.log(`Room: ${r.name}, ID: ${r.id}, Beds24_ID: '${r.beds24_room_id}' (Type: ${typeof r.beds24_room_id})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

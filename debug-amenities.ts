
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const rooms = await prisma.room.findMany();
    console.log("--- ROOM AMENITIES DEBUG ---");
    for (const room of rooms) {
        console.log(`Room: ${room.name} (${room.slug})`);
        console.log(`Raw Amenities: ${room.amenities}`);
        try {
            const parsed = JSON.parse(room.amenities);
            console.log(`Parsed Array: ${JSON.stringify(parsed)}`);
        } catch (e) {
            // @ts-ignore
            console.log(`Error parsing JSON: ${e.message}`);
        }
        console.log("--------------------------------");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

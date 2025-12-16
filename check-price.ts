
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const room = await prisma.room.findUnique({
        where: { slug: 'ground-floor-small' }
    });
    console.log('Room:', room);
    console.log('Price:', room?.price);
    console.log('Beds24 ID:', room?.beds24_room_id);
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());

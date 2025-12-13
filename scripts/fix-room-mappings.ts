
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function fixMappings() {
    console.log("🛠️ Fixing Room Mappings...");

    const updates = [
        { name: 'California King Room', id: '632030' },
        { name: 'Queen Room', id: '632029' },
        { name: 'Ground Floor Small Room', id: '632031' },
        { name: 'King Room', id: '632028' }
    ];

    for (const update of updates) {
        // Use exact match or safer 'equals'
        const room = await prisma.room.findFirst({
            where: { name: update.name }
        });

        if (room) {
            console.log(`✅ Found ${room.name}. Updating ID to ${update.id}...`);
            await prisma.room.update({
                where: { id: room.id },
                data: { beds24_room_id: update.id }
            });
        } else {
            console.error(`❌ Could not find room matching "${update.name}"`);
        }
    }
}

fixMappings()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

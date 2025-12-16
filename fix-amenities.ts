
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STANDARD_AMENITIES = [
    "Private balcony",
    "Air conditioning",
    "Free Wi-Fi",
    "Smart TV with Netflix",
    "Private bathroom",
    "Hot water",
    "Towels & toiletries",
    "Wardrobe",
    "Mini fridge",
    "Patio Access", // Ensure Title Case
    "Daily cleaning",
];

function normalizeAmenity(a: string): string {
    // Map known variations to standard
    if (a.toLowerCase() === "patio access") return "Patio Access";
    if (a.toLowerCase() === "smart tv with netflix") return "Smart TV with Netflix";
    if (a.toLowerCase() === "free wi-fi") return "Free Wi-Fi";
    // Default: trim
    return a.trim();
}

async function main() {
    const rooms = await prisma.room.findMany();
    console.log("--- AMENITY CLEANUP ---");
    for (const room of rooms) {
        try {
            let amenities: string[] = JSON.parse(room.amenities);
            console.log(`Processing Room: ${room.name}`);
            console.log(`Original: ${JSON.stringify(amenities)}`);

            // Normalize and Deduplicate
            const uniqueAmenities = new Set<string>();
            for (const a of amenities) {
                uniqueAmenities.add(normalizeAmenity(a));
            }

            const cleaned = Array.from(uniqueAmenities);
            console.log(`Cleaned: ${JSON.stringify(cleaned)}`);

            if (JSON.stringify(cleaned) !== JSON.stringify(amenities)) {
                console.log("Updating...");
                await prisma.room.update({
                    where: { id: room.id },
                    data: { amenities: JSON.stringify(cleaned) }
                });
                console.log("Updated.");
            } else {
                console.log("No changes needed.");
            }
            console.log("--------------------------------");
        } catch (e) {
            // @ts-ignore
            console.log(`Error processing room ${room.name}: ${e.message}`);
        }
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

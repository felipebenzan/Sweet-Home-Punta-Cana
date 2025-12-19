
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🔧 Fixing Santo Domingo Slug...");

    // Find the record with the long slug
    const record = await prisma.excursion.findUnique({
        where: { slug: 'santo-domingo-city-tour' }
    });

    if (record) {
        console.log(`Found record: ${record.title} (${record.slug})`);

        // Check if 'santo-domingo' already exists (to avoid collision)
        const collision = await prisma.excursion.findUnique({
            where: { slug: 'santo-domingo' }
        });

        if (collision) {
            console.log("⚠️ Target slug 'santo-domingo' already exists! Deleting old collision...");
            await prisma.excursion.delete({
                where: { slug: 'santo-domingo' }
            });
        }

        // Update the slug
        const updated = await prisma.excursion.update({
            where: { id: record.id },
            data: { slug: 'santo-domingo' }
        });

        console.log(`✅ Success! Updated slug to: ${updated.slug}`);
        console.log(`Current Price in DB: $${updated.priceAdult}`);
    } else {
        console.log("❌ Could not find 'santo-domingo-city-tour' to fix.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

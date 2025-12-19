
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Searching for ALL Santo Domingo records...");

    const matches = await prisma.excursion.findMany({
        where: {
            OR: [
                { slug: { contains: 'santo' } },
                { title: { contains: 'Santo' } }
            ]
        }
    });

    if (matches.length === 0) {
        console.log("❌ No records found matching 'Santo'.");
    } else {
        console.log(`✅ Found ${matches.length} records:`);
        matches.forEach(e => {
            console.log(`------------------------------------------------`);
            console.log(`ID:       ${e.id}`);
            console.log(`Slug:     ${e.slug}`);
            console.log(`Title:    ${e.title}`);
            console.log(`Price:    $${e.priceAdult}`);
            console.log(`Images:   ${e.image}`);
            console.log(`------------------------------------------------`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

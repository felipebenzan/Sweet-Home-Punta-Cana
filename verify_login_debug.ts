
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAdmin() {
    console.log('--- Verifying Admin User ---');

    // 1. Fetch user
    const email = 'admin@sweethome.com';
    console.log(`Searching for user: ${email}...`);
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error('❌ User NOT found in database.');
        return;
    }

    console.log('✅ User found:', user.email);
    console.log('   Role:', user.role);
    console.log('   Password Hash:', user.password);

    // 2. Test Password
    const plainPassword = 'Admin123!';
    console.log(`Testing password: ${plainPassword}...`);
    const isValid = await bcrypt.compare(plainPassword, user.password);

    if (isValid) {
        console.log('✅ Password works! Login logic is correct.');
    } else {
        console.error('❌ Password mismatch. Hash verification failed.');
    }

    // 3. Check specific Prisma connection env
    // (Prisma doesn't easily expose the raw URL in the public API without logging, but knowing we found the user confirms connection works)
}

checkAdmin()
    .catch((e) => {
        console.error('❌ Unexpected error:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

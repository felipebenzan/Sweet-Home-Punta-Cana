import { UserEditor } from '../user-editor';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const user = await prisma.user.findUnique({
        where: { id: params.id },
    });

    if (!user) {
        notFound();
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold font-serif text-shpc-dark">Edit Member</h1>
            <UserEditor user={user} />
        </div>
    );
}

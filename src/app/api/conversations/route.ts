import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

// GET: List all conversations for the current user (as customer or owner)
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { userId: userId }, // User is the customer
                    { business: { ownerId: userId } } // User is the business owner
                ]
            },
            include: {
                business: {
                    select: { id: true, name: true, logo: true, ownerId: true }
                },
                user: {
                    select: { id: true, name: true, image: true }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Format for frontend
        const formatted = conversations.map(c => ({
            id: c.id,
            partner: c.userId === userId ? c.business : c.user,
            // @ts-ignore
            lastMessage: c.messages[0]?.content || 'No messages yet',
            // @ts-ignore
            updatedAt: c.messages[0]?.createdAt || c.updatedAt,
            isOwner: c.business.ownerId === userId // To know perspective
        }));

        return NextResponse.json(formatted);

    } catch (error) {
        console.error('Conversations Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

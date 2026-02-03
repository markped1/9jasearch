
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get('conversationId');
        const businessId = searchParams.get('businessId');

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let convId = conversationId;

        // If creating a chat from profile, we might not have convId yet
        if (!convId && businessId) {
            const existing = await prisma.conversation.findUnique({
                where: {
                    userId_businessId: {
                        userId: session.user.id,
                        businessId: businessId // Assuming user is the customer here
                    }
                }
            });
            if (existing) convId = existing.id;
            else return NextResponse.json([]); // No chat yet
        }

        if (!convId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const messages = await prisma.message.findMany({
            where: { conversationId: convId },
            orderBy: { createdAt: 'asc' }
        });

        // Determine if current user is 'owner' (business) or 'user' (customer)
        // We need conversation details to know
        const conv = await prisma.conversation.findUnique({
            where: { id: convId },
            include: { business: true }
        });

        if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Simple enrichment
        const enriched = messages.map(m => ({
            ...m,
            isMine: m.senderId === session.user?.id
        }));

        return NextResponse.json({
            messages: enriched,
            conversationId: convId,
            // @ts-ignore
            recipientName: session.user.id === conv.userId ? conv.business.name : 'Customer' // Simplified
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

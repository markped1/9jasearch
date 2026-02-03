
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { businessId, content, conversationId } = await request.json();
        const senderId = session.user.id;

        let finalConvId = conversationId;

        // If no conversationId, try to find or create one
        if (!finalConvId && businessId) {
            // Check if exists
            const existing = await prisma.conversation.findUnique({
                where: {
                    userId_businessId: {
                        userId: senderId,
                        businessId: businessId
                    }
                }
            });

            if (existing) {
                finalConvId = existing.id;
            } else {
                // Create new
                const newConv = await prisma.conversation.create({
                    data: {
                        userId: senderId,
                        businessId: businessId
                    }
                });
                finalConvId = newConv.id;
            }
        }

        if (!finalConvId) {
            return NextResponse.json({ error: 'Missing conversationId or businessId' }, { status: 400 });
        }

        // Create Message
        const message = await prisma.message.create({
            data: {
                content,
                conversationId: finalConvId,
                senderId
            }
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: finalConvId },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(message);

    } catch (error) {
        console.error('Send Message Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

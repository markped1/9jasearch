import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const business = await prisma.business.findFirst({
            where: {
                ownerId: session.user.id
            },
            include: {
                // @ts-ignore
                offers: true,
                appointments: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }

        return NextResponse.json(business);
    } catch (error) {
        console.error('Owner Business API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

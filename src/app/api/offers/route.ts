
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { businessId, title, description, code, expiresAt } = body;

        // Verify ownership
        const business = await prisma.business.findUnique({
            where: { id: businessId }
        });

        if (!business || business.ownerId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const offer = await prisma.offer.create({
            data: {
                businessId,
                title,
                description,
                code,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });

        return NextResponse.json(offer);

    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
        return NextResponse.json({ error: 'Missing businessId' }, { status: 400 });
    }

    try {
        const offers = await prisma.offer.findMany({
            where: {
                businessId,
                isActive: true,
                // Optional: Filter out expired?
                // OR: [
                //   { expiresAt: { gt: new Date() } },
                //   { expiresAt: null }
                // ]
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(offers);
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

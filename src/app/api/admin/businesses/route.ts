import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
        const where: any = {};
        if (status) {
            where.status = status;
        }

        const businesses = await prisma.business.findMany({
            where,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            }
        });

        return NextResponse.json(businesses);
    } catch (error) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

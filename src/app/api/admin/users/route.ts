import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, email: true, name: true, role: true, createdAt: true,
                _count: { select: { reviews: true } }
            }
        });
        return NextResponse.json({ users });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId, action } = await request.json();
        if (action === 'MAKE_ADMIN') {
            await prisma.user.update({ where: { id: userId }, data: { role: 'ADMIN' } });
        } else if (action === 'SUSPEND') {
            await prisma.user.update({ where: { id: userId }, data: { role: 'SUSPENDED' } });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Action failed' }, { status: 500 });
    }
}

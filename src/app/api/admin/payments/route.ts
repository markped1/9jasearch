import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const payments = await prisma.payment.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: { business: { select: { name: true, city: true } } }
        });
        const totalRevenue = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
        return NextResponse.json({ payments, totalRevenue });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }
}

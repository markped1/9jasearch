import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        // @ts-ignore
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parallelize queries for speed
        const [
            totalUsers,
            totalBusinesses,
            pendingVerifications,
            silverBusinesses,
            goldBusinesses,
            platinumBusinesses,
            recentPayments
        ] = await Promise.all([
            prisma.user.count(),
            prisma.business.count(),
            prisma.business.count({ where: { isVerified: false, tier: { not: 'FREE' } } }), // Or dedicated verification request model
            prisma.business.count({ where: { tier: 'SILVER' } }),
            prisma.business.count({ where: { tier: 'GOLD' } }),
            prisma.business.count({ where: { tier: 'PLATINUM' } }),
            prisma.payment.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { business: { select: { name: true } } }
            })
        ]);

        // Calculate Revenue (Approximation based on payments table)
        const totalRevenueResult = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: 'success' }
        });
        const totalRevenue = totalRevenueResult._sum.amount || 0;

        return NextResponse.json({
            stats: {
                totalUsers,
                totalBusinesses,
                pendingVerifications,
                revenue: totalRevenue,
                tiers: {
                    silver: silverBusinesses,
                    gold: goldBusinesses,
                    platinum: platinumBusinesses
                }
            },
            recentPayments
        });

    } catch (error) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

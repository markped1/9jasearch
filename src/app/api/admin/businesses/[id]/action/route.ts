import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { action } = body;

        if (action === 'approve') {
            const business = await prisma.business.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    isActive: true,
                    isVerified: true,
                }
            });
            return NextResponse.json(business);
        }

        if (action === 'reject') {
            const business = await prisma.business.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    isActive: false,
                }
            });
            return NextResponse.json(business);
        }

        if (action === 'toggle-featured') {
            const biz = await prisma.business.findUnique({ where: { id } });
            const isNowFeatured = !biz?.isFeatured;
            const business = await prisma.business.update({
                where: { id },
                data: {
                    isFeatured: isNowFeatured,
                    sponsoredUntil: isNowFeatured
                        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        : null
                }
            });
            return NextResponse.json(business);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Admin Action API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

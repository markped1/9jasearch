import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
    try {
        const session = await auth();
        // @ts-ignore
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { businessId, action } = body; // action: 'APPROVE' or 'REJECT'

        if (!businessId || !['APPROVE', 'REJECT'].includes(action)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        if (action === 'APPROVE') {
            await prisma.business.update({
                where: { id: businessId },
                data: {
                    isVerified: true,
                    // Optionally upgrade tier if it was purely a verification request not tied to payment
                    // For now, if they manually verify, maybe they get SILVER? 
                    // Let's assume manual verification grants VERIFIED status but keeps tier as is (or SILVER if FREE)
                    // Let's just set verified.
                }
            });
        } else {
            // Reject usually means un-verifying
            await prisma.business.update({
                where: { id: businessId },
                data: {
                    isVerified: false
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

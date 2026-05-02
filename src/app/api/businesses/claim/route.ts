import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

// POST — business owner claims an existing listing
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { businessId, phone, message } = await request.json();
        if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 });

        const business = await prisma.business.findUnique({ where: { id: businessId } });
        if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        if (business.ownerId) return NextResponse.json({ error: 'Already claimed' }, { status: 409 });

        // Create a claim request stored as a VerificationRequest
        await prisma.verificationRequest.create({
            data: {
                businessId,
                status: 'PENDING',
                documents: JSON.stringify({ claimedBy: session.user.id, phone, message }),
            }
        });

        return NextResponse.json({ success: true, message: 'Claim submitted. Admin will review within 24 hours.' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

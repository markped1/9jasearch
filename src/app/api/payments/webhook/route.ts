import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const secret = process.env.PAYSTACK_SECRET_KEY || 'MOCK_SECRET';
        const body = await request.json();

        // In production: Verify the event signature
        // const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(body)).digest('hex');
        // if (hash !== request.headers.get('x-paystack-signature')) { ... }

        if (body.event === 'charge.success') {
            const { businessId } = body.data.metadata || {};

            if (businessId) {
                await prisma.business.update({
                    where: { id: businessId },
                    data: {
                        isFeatured: true,
                        tier: 'VERIFIED', // Autoverify on payment
                        sponsoredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    }
                });
                console.log(`[PAYMENT] Success: Business ${businessId} upgraded to Featured`);
            }
        }

        return NextResponse.json({ status: true });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

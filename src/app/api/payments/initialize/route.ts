import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

// Use test secret key for development, switch to live for production
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || 'sk_test_...'; // Ideally from env

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'BUSINESS') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { plan, businessId } = body; // plan: 'SILVER', 'GOLD', 'PLATINUM'

        if (!['SILVER', 'GOLD', 'PLATINUM'].includes(plan)) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        let amount = 0;
        switch (plan) {
            case 'SILVER': amount = 10000 * 100; break;
            case 'GOLD': amount = 25000 * 100; break;
            case 'PLATINUM': amount = 50000 * 100; break;
        }

        const email = session.user.email;

        // Initialize Paystack transaction
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                amount,
                callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/verify`,
                metadata: {
                    businessId,
                    plan,
                    userId: session.user.id
                }
            })
        });

        const data = await response.json();

        if (!data.status) {
            return NextResponse.json({ error: data.message || 'Payment initialization failed' }, { status: 400 });
        }

        // We don't save the payment record yet, we wait for verification webhook or callback
        // But for better UX tracking, we CAN create a 'pending' record if we want.
        // Let's create a pending record to track the reference.
        await prisma.payment.create({
            data: {
                reference: data.data.reference,
                amount: amount / 100,
                status: 'pending',
                plan,
                email: email!,
                businessId
            }
        });

        return NextResponse.json({ authorization_url: data.data.authorization_url, reference: data.data.reference });

    } catch (error) {
        console.error('Payment Init Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

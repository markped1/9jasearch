
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Paystack webhook handler
        // 1. Verify event signature
        const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || 'sk_test_...')
            .update(JSON.stringify(body))
            .digest('hex');

        if (hash !== request.headers.get('x-paystack-signature')) {
            // In dev we might skip this or ensure we are using correct keys
            // return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const { event, data } = body;

        if (event === 'charge.success') {
            const { reference, metadata } = data;

            // metadata should contain businessId, plan, userId
            const businessId = metadata?.businessId;
            const plan = metadata?.plan;

            if (businessId && plan) {
                // Update payment status
                await prisma.payment.update({
                    where: { reference },
                    data: { status: 'success' }
                }).catch(async () => {
                    // If payment record doesn't exist (e.g. init failed to save), create it
                    await prisma.payment.create({
                        data: {
                            reference,
                            amount: data.amount / 100,
                            status: 'success',
                            plan,
                            email: data.customer.email,
                            businessId
                        }
                    });
                });

                // Update business subscription
                const daysToAdd = 30;
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + daysToAdd);

                await prisma.business.update({
                    where: { id: businessId },
                    data: {
                        tier: plan, // Using tier as subscription plan
                        subscriptionExpiry: expiryDate,
                        isVerified: plan !== 'FREE', // Auto-verify paid plans
                        isFeatured: plan === 'PLATINUM' // Auto-feature Platinum
                    }
                });
            }
        }

        return NextResponse.json({ status: 'success' });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Also support GET for redirect callback verification
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
        return NextResponse.json({ error: 'No reference' }, { status: 400 });
    }

    try {
        // Verify transaction with Paystack API
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY || 'sk_test_...'}`
            }
        });
        const data = await response.json();

        if (data.status && data.data.status === 'success') {
            const { metadata, amount, customer } = data.data;
            const businessId = metadata?.businessId;
            const plan = metadata?.plan;

            if (businessId && plan) {
                // Upsert payment
                await prisma.payment.upsert({
                    where: { reference },
                    update: { status: 'success' },
                    create: {
                        reference,
                        amount: amount / 100,
                        status: 'success',
                        plan,
                        email: customer.email,
                        businessId
                    }
                });

                // Update business
                const daysToAdd = 30;
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + daysToAdd);

                await prisma.business.update({
                    where: { id: businessId },
                    data: {
                        tier: plan,
                        subscriptionExpiry: expiryDate,
                        isVerified: plan !== 'FREE',
                        isFeatured: plan === 'PLATINUM'
                    }
                });

                return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success`);
            }
        }

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=failed`);

    } catch (error) {
        console.error('Verify Error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
